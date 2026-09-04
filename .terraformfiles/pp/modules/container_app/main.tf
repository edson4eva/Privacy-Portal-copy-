resource "azurerm_container_app" "pp_container_app" {
  name                         = var.container_app_name
  container_app_environment_id = var.container_app_environment_id
  resource_group_name          = var.resource_group_name
  max_inactive_revisions        = var.max_inactive_revisions
  revision_mode                = "Single"
  workload_profile_name        = var.supports_workload_profiles ? "Consumption" : null

  dynamic "identity" {
    for_each = var.identity != null && var.identity != "" ? [var.identity] : []
    content {
      type         = var.identity
      identity_ids = [var.identity_ids]
    }
  }

  dynamic "ingress" {
    for_each = var.ingress != null ? [var.ingress] : []
    content {
      external_enabled = var.ingress.external_enabled
      target_port      = var.ingress.target_port
      transport        = var.ingress.transport

      dynamic "traffic_weight" {
        for_each = ingress.value.traffic_weight != null ? ingress.value.traffic_weight : []
        content {
          latest_revision = traffic_weight.value.latest_revision
          revision_suffix = traffic_weight.value.latest_revision == false ? traffic_weight.value.revision_suffix : null
          percentage      = traffic_weight.value.percentage
        }
      }
    }
  }

  dynamic "dapr" {
    for_each = var.dapr_config != null ? [var.dapr_config] : []
    content {
      app_id       = var.dapr_config.app_id
      app_port     = var.dapr_config.app_port
      app_protocol = var.dapr_config.app_protocol
    }
  }

  secret {
    name  = var.password_secret_name
    value = var.password_secret_value
  }

  registry {
    server               = var.container_registry_url
    username             = var.container_registry_name
    password_secret_name = var.password_secret_name
  }

  template {
    max_replicas = var.max_replicas
    min_replicas = var.min_replicas

    dynamic "http_scale_rule" {
      for_each = var.http_scale_rules != null ? [var.http_scale_rules] : []
      content {
        name = http_scale_rule.value.name
        concurrent_requests = http_scale_rule.value.concurrent_requests
      }
    }

    container {
      name   = var.container_app_name
      image  = var.container_image_name
      cpu    = var.cpu
      memory = var.memory

      dynamic "env" {
        for_each = var.environment_variables
        content {
          name  = env.key
          value = env.value
        }
      }
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].container[0].env,
      template[0].container[0].image,
      container_app_environment_id,
      identity,
      secret
    ]
  }

  tags = {}
}
