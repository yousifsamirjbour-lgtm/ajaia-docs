# Ajaia Docs - Terraform Infrastructure Configuration

## Overview
This Terraform configuration declares the AWS infrastructure for **Ajaia Docs** in `eu-north-1` (Stockholm).

## Strict Zero-Cost & Free-Tier Invariant
- **AWS Free Tier Policy:** 750 hours/month of `t3.micro` or `t2.micro` instances combined across the entire AWS account.
- **Co-Hosting Topology:** The candidate's AWS account actively runs an existing production instance (`SocialFeed`). To maintain zero-cost compliance without exceeding the 750 hour monthly ceiling, Ajaia Docs is packaged via multi-stage Docker and reverse-proxied through Nginx on the existing Free Tier host.
- **Port Isolation:** Internal Docker port `127.0.0.1:3000` mapped to Nginx virtual host for `ajaiadocsyousifjbour.duckdns.org` and default HTTP server.

## Usage

```bash
# Initialize Terraform
terraform init

# Plan Infrastructure
terraform plan

# Apply (when provisioning standalone resources)
terraform apply
```
