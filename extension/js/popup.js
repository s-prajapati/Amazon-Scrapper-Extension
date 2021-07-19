chrome.runtime.sendMessage({
    destination: 'open popup'
}, (response) => {
    if(response.status === 'logged in') {
        window.location.href = '#!/home'
    } else {
        window.location.href = '#!/login'
    }
})

const amazonextension = angular.module('amazonextension', ['ui.router'])
.config([
    '$stateProvider',
    '$urlRouterProvider',
    ($stateProvider, $urlRouterProvider) => {
        $stateProvider.state('home', {
            url: '/home',
            templateUrl: '../html/home.html',
        }).state('login', {
            url: '/login',
            templateUrl: '../html/login.html'
        }).state('signup', {
            url: '/signup',
            templateUrl: '../html/signup.html'
        })

        $urlRouterProvider.otherwise('login')
    }
])
.controller('LoginController', function($scope) {
    $scope.email = '';
    $scope.password = '';
    $scope.message = '';

    $scope.login = function() {
        const creds = {
            destination: 'login',
            email : $scope.email,
            password : $scope.password
        }
        chrome.runtime.sendMessage(creds, function(response) {
            if(response.status === 'success') {
                $scope.email = '';
                $scope.password = '';
                window.location.href = '#!/home'
            } else {
                $scope.message = 'Error: Could not log in\nPlease check your credentials'
            }

            $scope.$apply();
        })
    }
})
.controller('SignupController', function($scope) {
    $scope.email = "";
    $scope.username = "";
    $scope.password = "";
    $scope.message = ""
    
    $scope.signup = () => {
        $scope.message = "";
        const creds = {
            destination: 'signup',
            email: $scope.email,
            username: $scope.username,
            password : $scope.password
        }
        
        chrome.runtime.sendMessage(creds, function(response) {
            if(response.status === 'success') {
                $scope.email = "";
                $scope.username = "";
                $scope.password = "";
                window.location.href = "#!/home"
            } else if(response.action === 'Retry') {
                $scope.message = ('Encountered an error. Please try again later')
            } else if(response.action === 'Redirect Login') {
                $scope.message = ('This email is already registered with a user')
            } else if(response.errors) {
                $scope.message = 'Please enter valid credentials\n';
            } else {
                $scope.message = ('Please try again')
            }

            $scope.$apply();
        })
    }
})
.controller('HomeController', ($scope) => {
    $scope.fetching = false;
    $scope.itemList = [];
    $scope.message = "";

    $scope.showTracked = () => {
        chrome.runtime.sendMessage({
            destination: 'show tracked'
        }, (response) => {
            if(response.status === 'success') {
                $scope.itemList = response.itemList;
                $scope.message = '';
            } else {
                $scope.message = 'Encountered an error. \n Please try again later';
            };

            $scope.$apply();
        });
    };
    
    $scope.trackItem = () => {
        $scope.itemList = [];
        chrome.runtime.sendMessage({
            destination: 'track current'
        }, (response) => {
            if(response.status === 'success') {
                $scope.message = 'Successfully Added Item'
            } else {
                if(response.action === 'Change Page') {
                    $scope.message = "This doesn't seem to be a valid item page"
                } else {
                    $scope.message = 'Encountered an error \n Please try again later'
                }
            }

            $scope.$apply();
        })
    };

    $scope.logout = () => {
        chrome.runtime.sendMessage({
            destination: 'logout'
        }, () => {
            window.location.href = '#!/login'
        })
    }
})
