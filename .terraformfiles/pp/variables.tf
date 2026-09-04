variable "ENVIRONMENT" {
  description = "The environment being terraformed"
  type        = string
}

variable "canadianlocation" {
  description = "The location/region where the core network will be created."
  default     = "CanadaCentral"
}

variable "ARM_SUBSCRIPTION_ID" {
  description = "Azure Subscription ID"
  type        = string
}

variable "ARM_CLIENT_ID" {
  description = "Service Principal Client ID"
  type        = string
}

variable "ARM_CLIENT_SECRET" {
  description = "Service Principal Client Secret"
  type        = string
  sensitive   = true
}

variable "ARM_TENANT_ID" {
  description = "Azure Tenant ID"
  type        = string
}

variable "azure_registry_key" {
  description = "The password or access key for the Azure Container Registry"
  type        = string
}
