variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "eu-north-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "ajaia-docs"
}

variable "instance_type" {
  description = "EC2 instance type (Free Tier eligible: t3.micro in eu-north-1)"
  type        = string
  default     = "t3.micro"
}

variable "domain_name" {
  description = "Target domain or DuckDNS subdomain"
  type        = string
  default     = "ajaiadocsyousifjbour.duckdns.org"
}
