tasksController = function (){
    var $taskPage;
    var initialised = false;
	var taskCount = 0;
	
	function errorLogger(errorCode, errorMessage){
		console.log(errorCode + ' : ' + errorMessage);
	}

    function updateTaskCount(){
        // var count = $taskPage.find('#tblTasks tbody tr').length;
        $('footer').find('#taskCount').text(taskCount);
    }
    
    function clearTask(){
        $taskPage.find('form').fromObject({});
    }
    
    function bandTableRows(){
            //Color for even-lined rows
        $taskPage.find('tbody tr:even').removeClass('even');
        $taskPage.find('tbody tr:even').addClass('even');
        overdueAndWarningBands();
    }
    function ajaxTest1(){
        var aPromise = $.ajax({
            type:'GET',
            dataType:'json',
            url:'serversidedata/tasks.json',
            cache: false
        });
        aPromise.done(function(data){
                      console.log(data);
                      });
        aPromise.fail(function(data){
            console.log("JSON fails");
        });
    }
//### W8 CODE here
    function ajaxTest2(){
        var cachedTasks = function(){
            var tasks = null;
            return{
                getTasks: function(){
                    var deferred = $.Deferred();
                if(tasks)
                    deferred.resolve(tasks);
                else{
                 var ajaxPromise =$.ajax({url:"serversidedata/tasks.json"});
                 ajaxPromise.done(function(data){
                    tasks = data;
                 setTimeout(function(){deferred.resolve(tasks)},3000);
            })
    }
        return deferred.promise();
}
            }
        }();
console.log("start: " + getTime());
test(1);
setTimeout(test, 7000, 2);
console.log("end: "+getTime());

function test(testNumber){
    var promise;
    promise = cachedTasks.getTasks();
    promise.done(function(data){
        console.log(testNumber+" Success callback executed"+getTime());
    })
}

function getTime(){
    var now = new Date();
    return now.toLocaleTimeString() + ":"+ now.getMilliseconds();
}

}
function logPropertyValue(obj,property){
    console.log(obj[property]);
}

//CSV
//    function loadFromCSV(event){
//        var reader = new FileReader();
//        reader.onload = function(evt){
//            //console.log(evt.target.result); //initial test trace
//            var contents = evt.target.result;
//            var lines = contents.split('\n');
//            var tasks = [];
//
//            $.each(lines, function(i, val){
//                if(i >= 1 && val){
//                    var task = loadTask(val);
//                    if(task)
//                        tasks.push(task);
//                }
//            });
//
//            //TODO: save tasks in tasks data store
//            storageEngine.saveAll('task', tasks, function(){
//                tasksController.loadTasks();
//            }, errorLogger);
//
//        };
//
//        reader.onerror = function(evt){
//            errorLogger('cannot_read_file', 'Error reading the specified file');
//        };
//
//        reader.readAsText(event.target.files[0]);
//    }
//
//    function loadTask(csvTask){
//        var tokens = $.csv.toArray(csvTask);
//        if(tokens.length === 4){
//            var task = {};
//            task.task = tokens[0];
//            task.requiredBy = tokens[1];
//            task.category = tokens[2];
//            task.complete = tokens[3];
//            return task;
//        } else
//            return null;
//
//    }
//CSV
    function loadFromCSV(event){
        var reader = new FileReader();
        reader.onload = function(evt){
            //console.log(evt.target.result); //initial test trace
            var fileContents = evt.target.result;
            var lines = fileContents.split('\n');
            var tasks = [];
            var worker = new Worker('scripts/tasks-csvparser.js');
            worker.addEventListener('message',function(result){
                tasks = result.data;
                storageEngine.saveAll('task', tasks, function(){
                tasksController.loadTasks();
            }, errorLogger);
            },false);
            worker.postMessage(fileContents);
        };
        reader.onerror = function(evt){
            errorLogger('cannot_read_file', 'Error reading the specified file');
        };

        reader.readAsText(event.target.files[0]);
    }

//==============================================================================================
    function overdueAndWarningBands(){
        $.each($taskPage.find('tbody tr'), function(index, row){
            var $row = $(row);
            var dueDate = Date.parse($row.find("[datetime]").text());
            
            if(dueDate.compareTo(Date.today()) < 0){
                $row.removeClass('even');
                $row.addClass('overdue');
            } else if(dueDate.compareTo((2).days().fromNow()) <= 0) {
                $row.removeClass('even');
                $row.addClass('warning');
            }
        });
    }
    
    return{
        init: function(page, callback){
            if(!initialised){
                $taskPage = page;
                storageEngine.init(function(){
                 storageEngine.initObjectStore('task', function(){callback();}, errorLogger);
				}, errorLogger);
                
                
                //Required Tag
                $taskPage.find('[required="required"]').prev('label').append('<span>*</span>').children('span').addClass('required');

                //Click on row to highlight them, works dynamically (apply to all newly added rows)
                //when 
                
                $taskPage.find('tbody').on('click','td','time',function(evt){
                    $(evt.target).closest('td').siblings().addBack().toggleClass('rowHighlight');
                });
                //Shows up the add task form
                 $taskPage.find('#btnAddTask').click(function(evt){
                    evt.preventDefault();
                    $taskPage.find('#taskCreation').removeClass('not');
                });

                //Add input from form to the task table
                 $taskPage.find('#saveTask').click(function(evt){
                    evt.preventDefault();
                     if($taskPage.find('#taskForm').valid()){
                         var task = $taskPage.find('#taskForm').toObject();
                         task.complete = false;
                         storageEngine.save("task", task, function(){
							 // $taskPage.find('#tblTasks tbody ').empty();
							 
//							 taskCount++;
							 
							 tasksController.loadTasks();
							 clearTask();
                             
							  $taskPage.find('#taskCreation').addClass('not');
						 }, errorLogger);

                         
//						var rowCount = 0;
//                        $('footer').replaceWith('<footer> ' + rowCount + ' task(s) </footer>');
                         
                     }
                });


                $taskPage.find('#importFile').change(loadFromCSV);
				
				//clear all row
				$taskPage.find('#clearTask').click(function(evt){
//					var selectedTasks = $taskPage.find('#tblTasks tbody tr');
	//				var response = confirm("You want to delete All task? \n Yes or No");
//                       if(response){
//                            selectedTasks.remove();
//                            $(document).ready(function(){
//                                alert("All tasks deleted");
 //                           });
 //                       } else{
 //                       alert("Deletion cancelled");
 //                       }

					//StackOverflow: https://stackoverflow.com/questions/27735108/get-form-formdata-objects-from-input-element
					evt.preventDefault();
                    clearTask();
				});


                //Edit current row
                $taskPage.find('#tblTasks tbody').on('click','.editRow',function(evt){
                   $taskPage.find('#taskCreation').removeClass('not');
                   storageEngine.findById('task', $(evt.target).data().taskId,
                    function(task){
                       $taskPage.find('form').fromObject(task);
						
                    }, errorLogger);
                });
                
                // Complete task
               $taskPage.find('#tblTasks tbody').on('click','.completeRow',function(evt){
                 storageEngine.findById('task', $(evt.target).data().taskId, function(task){
                     task.complete = true;
                     storageEngine.save('task', task, function(){
                         tasksController.loadTasks();
                     }, errorLogger)
                 })
               });




                    //Delete current row
                 $taskPage.find('#tblTasks tbody').on('click','.deleteRow',function(evt){
                    evt.preventDefault();
					
					storageEngine.delete('task', $(evt.target).data().taskId, function(){
						$(evt.target).parents('tr').remove();
                        $taskPage.find('#tblTasks tbody ').empty();
						
//						taskCount--;
//						updateTaskCount();
				        tasksController.loadTasks();
                        bandTableRows();
                        
					}, errorLogger);

//                     var rowCount = $taskPage.find('#tblTasks tbody tr').length;
//                     $('footer').replaceWith('<footer> ' + rowCount + ' task(s) </footer>');
				    
                });

                
                
                //Delete multiple tasks (tasks which has highlighted) WTH HAPPENED CHECK AGAIN PLS
//                $taskPage.find('#btnDelTask').click(function(){
//                   var selectedTasks = $taskPage.find('#tblTasks tbody tr:has(.rowHighlight)');
//                    var numberOfTasks = selectedTasks.length;
//                    if(numberOfTasks > 0){
//                        var response = confirm("Delete " + numberOfTasks + " task(s)?");
//                        if(response){
//                            selectedTasks.remove();
//                            $(document).ready(function(){
//                               alert("Delete completed. " + numberOfTasks + " tasks deleted."); 
//                            });        
//                        } else {
//                            alert("Deletion canceled");
//                        }
//                    }
//                });   
                
                //Delete multiple tasks (tasks which has highlighted)
                        $taskPage.find('#btnDelTask').click(function(){
                        var selectedTasks = $taskPage.find('#tblTasks tbody tr:has(.rowHighlight)');
                        var numberOfTasks = selectedTasks.length;
                        if(numberOfTasks>0){
                        var response = confirm("Are you sure you want to delete " + numberOfTasks + "task(s)?");
                        if(response){
                            selectedTasks.each(function(index, elem){
                                    
                                    var idToDel = parseInt($(elem).find('[data-task-id]').data().taskId);

                                    storageEngine.delete('task', idToDel, function(){
                                        $(elem).parents('tr').remove()
                                    }, errorLogger );
                                });

                            selectedTasks.remove();
                            $(document).ready(function(){
                                $taskPage.find('#tblTasks tbody ').empty();
								
	//							taskCount -= numberOfTasks;
	//							updateTaskCount();
				                tasksController.loadTasks();
                                alert(numberOfTasks + " task(s) deleted");
								

                        });
                        
                       	
                        }else{
                        alert("Deletion cancelled");
                        }
                        
                    } 
                });
                
                
                
                //validate task field
                $taskPage.find('#taskForm').validate({
                    rules: {
						task: {
							required: true,
							maxlength: 20, 
							minlength: 2
						} 
					},
					//StackOverflow reference: https://stackoverflow.com/questions/2457032/jquery-validation-change-default-error-message
					messages: {
						task: {
							required: "Enter a task name!",
							minlength: "Enter at least 3 characters!",
			
						}
					},
					//,
					//StackOverflow Reference: https://stackoverflow.com/questions/2831680/how-to-display-unique-success-messages-on-jquery-form-validation
//					success: function(label) {
//							var name = label.attr('for');
//							label.text(name+ ' is valid!');
//					}

					//jqueryvalidation.org reference on success: https://jqueryvalidation.org/validate/
//					success: function(label) {
//						label.text("Valid!")
//					  }
					
                });
                
                initialised = true;
            }
            //NEW FROM W8
            $taskPage.find('#btnAjaxTest').click(function(evt){
                evt.preventDefault();
                //ajaxTest1();
                ajaxTest2();
            }); 

            $taskPage.find('#btnUncheckedExceptionTest').click(function(evt){
                evt.preventDefault();
                logPropertyValue(undefined,"Prop")
            }); 
            
            $taskPage.find('#btnDeleteAll').click(function(evt){
                evt.preventDefault();
                storageEngine.deleteAll('task',function(){
                tasksController.loadTasks();},errorLogger);
                
            }); 
            
        },


        
        //Load tasks from database
        loadTasks: function(){
            $taskPage.find('#tblTasks tbody').empty();
            storageEngine.findAll('task',function(tasks){

                tasks.sort(function(task1, task2){
                    var date1, date2;
                    date1 = Date.parse(task1.requiredBy);
                    date2 = Date.parse(task2.requiredBy);

                    return date1.compareTo(date2);
                })


               // $('#taskCount').html(tasks.length);

                $.each(tasks,function(index, task){
                    $('#taskRow').tmpl(task).appendTo($taskPage.find('#tblTasks tbody'))
                });
				
				taskCount = tasks.length;
                updateTaskCount();
                bandTableRows();
            }, errorLogger);

        }
        


        
        
        
        
        
        
        
        
        
        
        
        
    }



	}();