resource "azurerm_cosmosdb_account" "pp_cosmos_table" {
  name                = var.complains_table_name
  location            = var.location
  resource_group_name = var.resource_group_name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"
  consistency_policy {
    consistency_level       = "Session"
    max_interval_in_seconds = 5
    max_staleness_prefix    = 100
  }

  analytical_storage {
    schema_type = "WellDefined"
  }

  public_network_access_enabled = false
  is_virtual_network_filter_enabled = true
  capabilities {
    name = "EnableServerless"
  }

  backup {
    type                = "Periodic"
    interval_in_minutes = 240
    retention_in_hours  = 8
    storage_redundancy  = "Local"
  }

  geo_location {
    location          = "Canada Central"
    failover_priority = 0
  }

  lifecycle {
    ignore_changes = [
      identity,
      virtual_network_rule
    ]
  }
  tags = {
    defaultExperience       = "Core (SQL)"
    hidden-cosmos-mmspecial = ""
  }
}
