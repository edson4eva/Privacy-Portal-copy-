terraform {
  cloud {
    hostname     = "app.terraform.io"
    organization = "GovAlta"
    workspaces {
      name = "pp-dev"
      #name = "pp-syst"
      # name = "pp-uat"
      # name = "pp-prod-release"
      # name = "pp-prod"
    }
  }
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">=4.0.1"
    }
  }
}

