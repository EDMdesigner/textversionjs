pipeline {
	agent any
	tools {
		nodejs 'Node Argon [4.6.0] + mocha, gulp, grunt, jasmine'
	}
	stages {
		stage('build') {
			steps {
				sh 'npm install'
			}
		}
		stage('test') {
			steps {
				sh 'npm test'
			}
		}
		stage('publish test results') {
			steps {
				junit 'junitresults.xml'
				step(
					[$class: 'CoberturaPublisher',
					autoUpdateHealth: false,
					autoUpdateStability: false,
					coberturaReportFile: 'coverage/cobertura-coverage.xml',
					failUnhealthy: false,
					failUnstable: false,
					maxNumberOfBuilds: 0,
					onlyStable: false,
					sourceEncoding: 'ASCII',
					zoomCoverageChart: false]
				)
			}
		}
		stage('publish') {
			when {
				branch "master"
			}
			steps {
                withNPM(npmrcConfig:'npmrc-global') {
                    sh 'npm publish'
                }
			}
		}
	}
	post {
		always {
			cleanWs()
		}
		failure {
			slackSend color: 'danger', message: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})"
		}
		success {
			slackSend color: 'good', message: "SUCCESS: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})"
		}
		unstable {
			slackSend color: 'warning', message: "UNSTABLE: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})"
		}
	}
}