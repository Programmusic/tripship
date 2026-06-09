terraform {
  required_version = ">= 1.5"

  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {
  host = var.docker_host
}

module "postgres" {
  source = "./modules/postgres"

  container_name = "${var.project_name}-db"
  db_name        = var.db_name
  db_user        = var.db_user
  db_password    = var.db_password
  network_name   = docker_network.tripship.name
}

module "storage" {
  source = "./modules/storage"

  uploads_volume = "${var.project_name}-uploads"
}

resource "docker_network" "tripship" {
  name = "${var.project_name}-network"
}

resource "docker_volume" "uploads" {
  name = "${var.project_name}-uploads"
}

output "database_url" {
  description = "PostgreSQL connection string for the Trip Ship API"
  value       = module.postgres.connection_url
  sensitive   = true
}

output "uploads_volume" {
  description = "Docker volume name for DJ mix uploads"
  value       = docker_volume.uploads.name
}

output "network_name" {
  description = "Docker network for Trip Ship services"
  value       = docker_network.tripship.name
}
