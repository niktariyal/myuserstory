angular.module('storyCtrl',['storyService'])

.controller('StoryController',function(Story,socketio){
	
	var vm = this;
	vm.stories = {};
	Story.all()
		.success(function(data){
			vm.stories = data;
			console.log("inside story.allStory controller!");
		});
	vm.createStory = function(){
		vm.processing = true;
		vm.message = '';
		Story.create(vm.storyData)
			.success(function(data){
				console.log('inside createStory success method');
				//clear up the form
				vm.processing=false;
				vm.storyData = {};
				vm.message = data.message;
				//vm.stories.push(vm.message);
				//vm.stories.push(data);
				/*Story.all()
					.success(function(data){
						vm.stories=data;
					});*/
			});
	};
	socketio.on('story',function(data){
			console.log('inside StoryController : socketio.on: data::'+data)
			vm.stories.push(data);
	})

})
.controller('AllStoriesController',function(stories,socketio){
	var vm = this;
	vm.stories = stories.data;
	console.log('inside AllStoriesController: stories.data::'+stories.data)
	socketio.on('story',function(data){
		console.log('inside AllStoriesController : socketio.on :: data| '+data);
		vm.stories.push(data);
	});
});