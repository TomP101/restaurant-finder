pipeline {
  agent any

  environment {
    AWS_REGION     = 'eu-north-1'
    AWS_ACCOUNT_ID = '774305577837'
    ECR_REPO_BACKEND       = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/backend-repo"
    ECR_REPO_BACKEND       = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/frontend-repo"
    IMAGE_TAG      = "${GIT_COMMIT[0..6]}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Login to ECR') {
      steps {
        sh """
          aws ecr get-login-password --region ${AWS_REGION} \
            | docker login --username AWS --password-stdin ${ECR_REPO}
        """
      }
    }

    stage('Build & Push Backend Image') {
      steps {
        script {
          sh """
            echo "Buduję obraz backendu: ${ECR_REPO_BACKEND}:${IMAGE_TAG}"
            docker build \
              --file backend/Dockerfile \
              --tag ${ECR_REPO_BACKEND}:${IMAGE_TAG} \
              --tag ${ECR_REPO_BACKEND}:latest \
              backend/
          """

          sh """
            echo "Wypychanie obrazu backendu do ECR..."
            docker push ${ECR_REPO_BACKEND}:${IMAGE_TAG}
            docker push ${ECR_REPO_BACKEND}:latest
          """
        }
      }
    }

    stage('Build & Push Frontend Image') {
      steps {
        script {
          sh """
            echo "Buduję obraz frontendu: ${ECR_REPO_FRONTEND}:${IMAGE_TAG}"
            docker build \
              --file frontend/Dockerfile \
              --tag ${ECR_REPO_FRONTEND}:${IMAGE_TAG} \
              --tag ${ECR_REPO_FRONTEND}:latest \
              frontend/
          """

          sh """
            echo "Wypychanie obrazu frontendu do ECR..."
            docker push ${ECR_REPO_FRONTEND}:${IMAGE_TAG}
            docker push ${ECR_REPO_FRONTEND}:latest
          """
        }
      }
    }
  }

  post {
    success {
      echo """
      Obrazy zbudowane i wypchnięte do ECR:
        - Backend:  ${ECR_REPO_BACKEND}:${IMAGE_TAG}
        - Frontend: ${ECR_REPO_FRONTEND}:${IMAGE_TAG}
        """
      deleteDir()
    }
    failure {
      echo "Coś poszło nie tak podczas buildu/pusha obrazów."
      deleteDir()
    }
  }
}