pipeline {
    agent any

    parameters {
        choice(name: 'DEPLOY_ENV', choices: ['development', 'production'], description: 'Select the environment to deploy')
    }

    environment {
        DOCKER_IMAGE_BACKEND = "quiz-backend"
        DOCKER_IMAGE_FRONTEND = "quiz-frontend"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Tests') {
            steps {
                echo 'Running backend tests...'
                // If there were tests, run them in a python container
                // Example: docker run --rm quiz-backend-test pytest
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    if (params.DEPLOY_ENV == 'production') {
                        sh "docker compose -f docker-compose.prod.yml build"
                    } else {
                        sh "docker compose build"
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    if (params.DEPLOY_ENV == 'production') {
                        echo "Deploying to PRODUCTION environment..."
                        // Stop any existing production services
                        sh "docker compose -f docker-compose.prod.yml down"
                        // Start in detached mode
                        sh "docker compose -f docker-compose.prod.yml up -d"
                    } else {
                        echo "Deploying to DEVELOPMENT environment..."
                        // Stop any existing dev services
                        sh "docker compose down"
                        // Start in detached mode
                        sh "docker compose up -d"
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Successfully deployed the ${params.DEPLOY_ENV} environment."
        }
        failure {
            echo "Deployment failed for ${params.DEPLOY_ENV}."
        }
    }
}
