provider "azurerm" {
  features {}
  resource_provider_registrations = "none"
  subscription_id                 = local.env.subscription_id
}

data "azurerm_client_config" "current" {}
# variables stored in file
locals {
  env = merge(
    yamldecode(file("env/${var.ENVIRONMENT}.yaml"))
  )
}

resource "azurerm_resource_group" "rg_privacy_portal" {
  name     = local.env.env_resourcegroup
  location = var.canadianlocation
}

resource "azurerm_storage_account" "FileUpload-Storage" {
  name                     = local.env.fileupload_storage_account_name
  resource_group_name      = azurerm_resource_group.rg_privacy_portal.name
  location                 = azurerm_resource_group.rg_privacy_portal.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  # allow_blob_public_access = true
  allow_nested_items_to_be_public = true
  min_tls_version                 = "TLS1_2"
  # enable_https_traffic_only       = true

  static_website {
    index_document = "index.html"
  }
}

resource "azurerm_key_vault" "pp_key_vault" {
  name                = local.env.keyvault_name
  location            = var.canadianlocation
  purge_protection_enabled = true
  resource_group_name = azurerm_resource_group.rg_privacy_portal.name
  tenant_id           = local.env.tenant_id
  sku_name            = "standard"

  network_acls {
    default_action = "Deny"
    bypass         = "AzureServices"

    ip_rules = ["20.104.34.31/32"]

    virtual_network_subnet_ids = []
  }

  enabled_for_deployment          = false
  enabled_for_disk_encryption     = false
  enabled_for_template_deployment = false
  soft_delete_retention_days      = 90
  enable_rbac_authorization       = true
  tags                            = {}
}

resource "azurerm_redis_cache" "pp_redis" {
  name                 = local.env.redis_cache_name
  location             = var.canadianlocation
  resource_group_name  = azurerm_resource_group.rg_privacy_portal.name
  capacity             = 0
  family               = "C"
  shard_count          = var.ENVIRONMENT == "prod-release" ? 0 : null  
  sku_name             = var.ENVIRONMENT == "prod-release" ?  "Standard" : "Basic" 
  non_ssl_port_enabled = false
  minimum_tls_version  = "1.2"

  access_keys_authentication_enabled = true
  public_network_access_enabled = false

  redis_configuration {
    active_directory_authentication_enabled = true
  }
  tags = { "project" = "priv-portal" }
}

module "cosmosdb" {
  source = "./modules/cosmosdb"

  for_each             = toset(local.env.cosmosdb_list)
  location             = var.canadianlocation
  resource_group_name  = azurerm_resource_group.rg_privacy_portal.name
  complains_table_name = each.key
}

resource "azurerm_container_registry" "pp_acr" {
  name                = local.env.container_registry_name
  resource_group_name = azurerm_resource_group.rg_privacy_portal.name
  location            = var.canadianlocation
  sku                 = "Basic"
  admin_enabled       = true
  identity {
    type = "SystemAssigned"
  }
}

resource "azurerm_log_analytics_workspace" "log_analytics_ws" {
  name                = local.env.log_analytics_workspace_name
  location            = var.canadianlocation
  resource_group_name = azurerm_resource_group.rg_privacy_portal.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

resource "azurerm_application_insights" "application_insights" {
  name                = local.env.application_insights_name
  location            = var.canadianlocation
  resource_group_name = azurerm_resource_group.rg_privacy_portal.name
  workspace_id        = azurerm_log_analytics_workspace.log_analytics_ws.id
  application_type    = "web"
}

resource "azurerm_container_app_environment" "container_app_env" {
  name                = local.env.container_app_environment_name
  location            = var.canadianlocation
  resource_group_name = var.ENVIRONMENT == "prod" ?"rg-privacy-portal-prod-release" : azurerm_resource_group.rg_privacy_portal.name
  tags                = {}
  lifecycle {
    ignore_changes = [
      infrastructure_resource_group_name,
      infrastructure_subnet_id
    ]
  }
}

module "containerapps" {
  source = "./modules/container_app"

  for_each                     = local.env.container-apps
  container_app_name           = each.key
  container_image_name         = each.value.container_image_name
  http_scale_rules             = each.value.http_scale_rules
  container_app_environment_id = azurerm_container_app_environment.container_app_env.id
  resource_group_name          = azurerm_resource_group.rg_privacy_portal.name
  location                     = var.canadianlocation
  log_analytics_workspace_name = local.env.log_analytics_workspace_name
  password_secret_name         = each.value.password_secret_name
  password_secret_value        = var.azure_registry_key
  max_replicas                 = try(each.value.max_replicas, 1)
  min_replicas                 = try(each.value.min_replicas, 1)
  cpu = try(each.value.cpu, "0.5")
  memory = try(each.value.memory, "1Gi")
  max_inactive_revisions = each.value.max_inactive_revisions != null ? each.value.max_inactive_revisions : 10
  environment_variables        = each.value.environment_variables
  container_registry_name      = local.env.container_registry_name
  container_registry_url       = local.env.container_registry_url
  identity                     = try(each.value.identity_type, null)
  identity_ids                 = try(each.value.identity_ids, null)
  supports_workload_profiles   = try(each.value.supports_workload_profiles, false)

  dapr_config = lookup(each.value, "dapr_config", null)
  ingress     = lookup(each.value, "ingress", null)
}
