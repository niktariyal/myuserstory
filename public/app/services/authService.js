angular.module('authService',[])

.factory('Auth',function($http,$q,AuthToken){
	
	var authFactory ={};
	
	authFactory.login =function(username,password){
		return $http.post('/api/login',{
			username: username,
			password: password
		})
		.success(function(data){
			AuthToken.setToken(data.token);
			console.log("Inside login method of authService: data:");
			console.log(data.token);
			return data;
		})
	}
	
	authFactory.logout = function(){
		AuthToken.setToken();
	}
	
	authFactory.isLoggedIn=function(){
		console.log("inside ...");
		if(AuthToken.getToken()){
			console.log("Token is taken!");
			return true;
		}else{
			console.log("Token is not present")
			return false;
		}
	}
	authFactory.getUser = function(){
		if(AuthToken.getToken()){
			return $http.get('/api/me');
		}else{
			return $q.reject({message:"User has no token"});
		}
	}
	return authFactory;
	
})

.factory('AuthToken', function($window){
	console.log("inside AuthToken Factory");
	var authTokenFactory={};

	authTokenFactory.getToken=function(){
		return $window.localStorage.getItem('token');
	}

	authTokenFactory.setToken=function(token){
		console.log("inside setToken:Token");
		console.log(token);
		if(token){

			$window.localStorage.setItem('token',token);
			console.log("Token is saved in localStorage");
		}else{
			$window.localStorage.removeItem('token');
			console.log("Token is removed from localStorage");
		}
	}
	return authTokenFactory;

})
.factory('AuthInterceptor',function($q,$location, AuthToken){
	var interceptorFactory = {};
	interceptorFactory.request = function(config){
		var token = AuthToken.getToken();
		if(token){
			config.headers['x-access-token']=token;
		}
		return config;
	}
	interceptorFactory.resposeError = function(response){
		if(response.status==403){
			$location.path('/login');
		}
		return $q.reject(response);
	}
	return interceptorFactory; 
});