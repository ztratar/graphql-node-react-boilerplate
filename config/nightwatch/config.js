require('babel-register');
module.exports = {
  "src_folders": ["test/e2e/tests"],
  "output_folder": "reports",
  "custom_commands_path": "",
  "custom_assertions_path": "",
  "page_objects_path": "test/e2e/pages",
  "globals_path": "config/nightwatch/globals",
  "selenium": {
    "start_process": true,
    "server_path": "./bin/selenium-server-standalone-3.0.1.jar",
    "log_path": "./reports",
    "port": 4444,
    "cli_args": {
      "webdriver.chrome.driver": process.env.OS_TYPE === 'osx' ? './bin/chromedriver-osx' : './bin/chromedriver-linux'
    }
  },
  "test_runner" : "mocha",
  "test_settings": {
    "default": {
      "launch_url": "https://www.google.com",
      "selenium_port": 4444,
      "selenium_host": "localhost",
      "silent": true,
      "desiredCapabilities": {
        "browserName": "chrome",
        "javascriptEnabled": true,
        "acceptSslCerts": true
      }
    }
  }
}
