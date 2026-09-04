variable "location" {
}

variable "resource_group_name" {
}

variable "log_analytics_workspace_name" {
}

variable "container_app_environment_id" {
}

variable "container_app_name" {
}

variable "container_image_name" {
}

variable "container_registry_name" {
  type        = string
  description = "The name of the Azure Container Registry"
}

variable "container_registry_url" {
  type        = string
  description = "The url of the Azure Container Registry"
}

variable "dapr_config" {
  type = map(any)
}

variable "environment_variables" {
  type = map(string)
}

variable "password_secret_name" {
  type = string
}

variable "password_secret_value" {
  type = string
}
variable "max_replicas" {
  default = 1
}
variable "min_replicas" {
  default = 1
}
variable "max_inactive_revisions" {
  default = 10
  description = "Maximum number of inactive revisions to keep for the container app."
}
variable "ingress" {
  type = object({
    external_enabled = bool
    target_port      = number
    transport        = string
    traffic_weight = list(object({
      latest_revision = bool
      percentage      = number
      revision_suffix = optional(string, null)
    }))
  })
}

variable "identity" {
  description = "The type of identity to assign to the container app, if required."
  type        = string
  default     = null
}

variable "identity_ids" {
  description = "List of user-assigned identity IDs, required if identity is 'UserAssigned'."
  type        = string
}

variable "supports_workload_profiles" {
  description = "Set to true if the environment supports custom workload profiles, false otherwise."
  type        = bool
  default     = false
}
variable "http_scale_rules" {
  
}
variable "cpu" {
  default = "0.5"
}
variable "memory" {
  default = "1.0Gi"
  
}