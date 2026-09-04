# Privacy Portal

🚨 **Terraform Enterprise**

Terraform state (.tfstate) is stored in TerraForm enterprise (https://terraform.gov.ab.ca)
Running Terraform locally utilizing a specific users .Z account will result in disaster with resources being destroyed and recreated.

⭐ **Execution**

Run to format

-   `terraform fmt`

Run to validate

-   `terraform validate`

Run to plan

-   `terraform plan`
-   `terraform plan -no-color > tfplan.txt`
    To view a human readable plan

Run to apply

-   `terraform apply -var-file="env/env-dev.tfvars"`
-   `terraform apply -var-file="env/env-uat.tfvars"`
-   `terraform apply -var-file="env/env-prod.tfvars"`

Run to show

-   `terraform show`

🔎 **Environment Variables**

Several Layers of variables of varying scope

-   `Terraform enterprise config files stores in the website itself`
    These names are injected in the manner they are due to Terraform not supporting interpolation of variables.
-   `.yaml files are PER environment and store variables with the appropriate environment string embedded within the resource (dev, uat, prod)`
    These names are injected in the manner they are due to Terraform not supporting interpolation of variables.
-   `.tf files are merged by terraform at runtime so there can be multiple that can be combined together
    -   `variables-overridable.tf are the variables that are global in scope and overwritten by Terraform enterprise variables`
-   `variables.tf are specific to each module - for the most part they serve as a interface that define what inputs will be passed into the module`

💡 **Environment Subscriptions**

Azure has 2 Subscriptions. When executing terraform scripts verify the execution is occuring in the approriate environment.
In the Main.tf file there are commented sections collelated to terraform workspaces (and state files)

-   `goa-platform_dev`
-   `goa-platform_prod`

If running locally do an AZ login then az account set --subscription 4b8ee168-917d-4a2e-b640-13ec7d98c7e3
This subscription is development

💡 **Plan commands**
Commands facilitate extracting infrastructure

This places an individual extracted resource into the statefile - From here it appears to be manual to put it back into the terraform yml files

-   `terraform import azurerm_app_service.pp-dev-complaints-service /subscriptions/4b8ee168-917d-4a2e-b640-13ec7d98c7e3/resourceGroups/rg-privacy-portal-dev/providers/Microsoft.App/containerApps/pp-dev-complaints-service`

-   `terraform plan -out infra.tfplan` //pulls out the binary
-   `terraform show -json infra.tfplan > infra.json` // formats the binary into json
