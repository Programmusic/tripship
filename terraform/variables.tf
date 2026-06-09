variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "tripship"
}

variable "docker_host" {
  description = "Docker daemon socket (default: local)"
  type        = string
  default     = "unix:///var/run/docker.sock"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "tripship"
}

variable "db_user" {
  description = "PostgreSQL username"
  type        = string
  default     = "tripship"
}

variable "db_password" {
  description = "PostgreSQL password"
  type        = string
  sensitive   = true
}
