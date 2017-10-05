angular.module('userCtrl',['userService'])

.controller('UserController', function(User){

	var vm = this;

	//vm.processing = true;

	User.all()
	.success(function(data){
		vm.users = data;
	})

})

.controller('UserCreateController', function(User, $location,$window){

	var vm = this;
	console.log("inside UserCreateController");
	vm.signupUser = function(){
		vm.message = '';
		console.log("inside signupUser")
		User.create(vm.userData)
			.then(function(response){
				console.log("inside UserCreateController:create:then");
				vm.userData = {};
				vm.message = response.data.message;
				console.log("vm.message: ");
				console.log(vm.message);
				$window.localStorage.setItem('token', response.data.token);
				$location.path('/');
			})
	}
})