(function() {
  'use strict';
  var directiveApp = angular.module('directiveApp', []);
  directiveApp.directive('ngFileUpload', ['$timeout', '$sce', '$http', function($timeout, $sce, $http){
    return {
      restrict: 'E',
      templateUrl: 'templates/ng-upload-tmpl.html',
      replace: true,
      scope: {
        id: "@",
        wistiaPass: "@"
      },
      link: function(scope, element, attrs){
        scope.hashId   = '';
        scope.progress = 0;
        scope.status   = 'idle';
        scope.url      = '';

        scope.checkStatus = function() {
          var promise = $http({
            method: 'GET',
            url: 'https://api.wistia.com/v1/medias/' + scope.hashId + '.json?api_password=' + scope.wistiaPass
          });
          promise.then(function (response) {
            scope.status = response.data.status || '';
            //check if the status is ready, set url for iframe
            if (scope.status == 'ready'){
              scope.url = $sce.trustAsResourceUrl('https://fast.wistia.net/embed/iframe/' + scope.hashId);
            } else if (scope.status != 'failed') {
              //check status every 3s
              $timeout(function(){
                scope.checkStatus();
              }, 3000);
            }
          });
        };

        $timeout(function(){
          $('#uploaderInput').fileupload({
            dataType: 'json',
            formData: {
              api_password: scope.wistiaPass
            },
            add: function (e, data) {
              scope.hashId   = '';
              scope.progress = 0;
              scope.status   = 'uploading';
              scope.url      = '';

              data.submit();
            },
            done: function (e, data) {
              if (data.result.hashed_id != '') {
                scope.hashId = data.result.hashed_id;
                scope.checkStatus();
              }
            },
            progressall: function (e, data) {
              if (data.total > 0) {
                scope.$apply(function(){
                  scope.progress = parseInt(data.loaded / data.total * 100, 10);
                });
              }
            }
          });
        });
      }
    }
  }])
})();