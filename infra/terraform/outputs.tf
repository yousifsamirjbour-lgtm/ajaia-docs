output "target_domain" {
  description = "Target domain for Ajaia Docs"
  value       = var.domain_name
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.ajaia_sg.id
}

output "aws_region" {
  description = "Deployment AWS region"
  value       = var.aws_region
}
