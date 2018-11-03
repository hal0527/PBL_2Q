var MAX_THREADS = 5;
var a = 0;
var test ;
function buildAddOn(e) {
  // Activate temporary Gmail add-on scopes.
  
  var taskList = taskListData();
  var cards = [];
  // Build a card for each recent thread from this email's sender.
  if (taskList.length > 0) {
    taskList.forEach(function(listDate) {
      cards.push(buildRecentThreadCard(listDate));
    });
  } else {
    // Present a blank card if there are no recent threads from
    // this sender.
    cards.push(CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader()
        .setTitle('No recent threads from this sender')).build());
  }
  return cards;
}

function taskListData() {
  var taskLists = Tasks.Tasklists.list().getItems();
  var recents = [];
  taskLists.forEach(function(taskList) {
      recents.push({ 
          'id': taskList.getId(),
          'name': taskList.getTitle(),
          'link': taskList.getSelfLink()
      });
    });
     Logger.log(recents);
      return recents;
}

function taskData(listDateID){
  var tasks = Tasks.Tasks.list(listDateID).getItems();
  var recents = [];
  var num = 1;
  tasks.forEach(function(task) {
      var taskNum = "test_"+num;
      recents.push({
          'num': taskNum,
          'id': task.getId(),
          'name': task.getTitle(),
          'status': task.getStatus(),
          'checked': false
      });
      
      num++;
    });
     Logger.log(recents);
     return recents;
  
}
 
 
 
 
function buildRecentThreadCard(listDate){
  var taskDate = taskData(listDate.id);
  var card = CardService.newCardBuilder();
  //var taskname = listTaskLists();
  card.setHeader(CardService.newCardHeader().setTitle(listDate.name)
 
             //.setImageStyle(CardService.ImageStyle.SQUARE)
             //.setImageUrl('https://www.example.com/images/headerImage.png')
                 );
  var section = CardService.newCardSection()
    .setHeader('<font color=\"#1257e0\">Recent thread</font>');
  
   　if (taskDate) {
         for (var a = 0; a < taskDate.length; a++) {
           var taskDate1 = taskDate[a];
           if(taskDate1.status == 'needsAction'){
           var checkboxGroup = CardService.newSelectionInput()
                              .setType(CardService.SelectionInputType.CHECK_BOX)
                              .setFieldName('test') //taskDate1.num
                              .addItem(taskDate1.name, taskDate1.name, false);
           //.setOnChangeAction(CardService.newAction()
            //                  .setFunctionName("handleCheckboxChange"));
                              
             //checkboxGroup.addItem(task.title, task.title, false)
              section.addWidget(checkboxGroup);
           } 
      }
      //return
  }
  //section.addWidget(checkboxGroup);
  var textButton = CardService.newTextButton()
    .setText("create")
    .setOnClickAction(CardService.newAction()
                                 .setFunctionName("handleCheckboxChange"));
  section.addWidget(CardService.newButtonSet().addButton(textButton));
  
  var textButton = CardService.newTextButton()
    .setText("Open Calendar Link")
    .setOpenLink(CardService.newOpenLink()
        .setUrl("https://calendar.google.com/calendar/r"));
  section.addWidget(CardService.newButtonSet().addButton(textButton));
  
  
  
  card.addSection(section);
  return card.build();
}








function handleCheckboxChange(e){
  var num = 1;
  var selected_CHECK = !!e.formInput.test;
  var createdate = e.formInputs.test;
 
  var event_date =new Array();
  //var eventName = e.formInput.checkbox_field;
  var endHour;
  var a = 0;
  var formattedDate = Utilities.formatDate(new Date(), "JST", "MMMMM d',' yyyy ");
  var formattedHour = Utilities.formatDate(new Date(), "JST","HH");
  var formattedtime = Utilities.formatDate(new Date(), "JST","mm");
  var now = new Date();
  var threeHoursFromNow = new Date(now.getTime() + (3 * 60 * 60 * 1000));
  var event_had = CalendarApp.getDefaultCalendar().getEvents(now, threeHoursFromNow);
  if(formattedtime <= 50){
     if(event_had){
      var time_min = Math.ceil(formattedtime/10)*10;
      formattedHour = parseInt(formattedHour) + event_had.length;
      endHour = parseInt(formattedHour) + 1;
     } else {
        var time_min = Math.ceil(formattedtime/10)*10;
        formattedHour = parseInt(formattedHour) ;
        endHour = parseInt(formattedHour) + 1;
        }
   } else {
    if(event_had){
      formattedHour = parseInt(formattedHour) + event_had.length ;
      endHour = parseInt(formattedHour) + 1;
      time_min ="00";
     } else {
      formattedHour = parseInt(formattedHour);
      endHour = parseInt(formattedHour) + 1;
      time_min ="00";
     }
  }
  var startDate = formattedDate + formattedHour+":"+time_min+":00";
  var endDate = formattedDate + endHour+":"+time_min+":00";
  
  // you can set and access paramters in the onchange action for further use.
    if(selected_CHECK) {
      //task.setStatus('completed');
      for(a = 0; a < createdate.length;a++){
       
      var event = CalendarApp.getDefaultCalendar().createEvent(createdate[a],
      new Date(startDate),
      new Date(endDate));}
        } else {
      delEvents('bbbb');
      }
 
  
//setUpdateDraftBodyAction(updateDraftBodyAction)
  
/*
  //var task = Tasks.Tasks.get(listDate.id, taskId);
  var selected = e.formInput.checkbox_TASK;
  var selected_CHECK = !!e.formInput.checkbox_TASK;
  var event_date =new Array();
  //var eventName = e.formInput.checkbox_field;
  var endHour;
  var a = 0;
  var formattedDate = Utilities.formatDate(new Date(), "JST", "MMMMM d',' yyyy ");
  var formattedHour = Utilities.formatDate(new Date(), "JST","HH");
  var formattedtime = Utilities.formatDate(new Date(), "JST","mm");
  var now = new Date();
  var threeHoursFromNow = new Date(now.getTime() + (3 * 60 * 60 * 1000));
  var event_had = CalendarApp.getDefaultCalendar().getEvents(now, threeHoursFromNow);
  if(formattedtime <= 50){
     if(event_had){
      var time_min = Math.ceil(formattedtime/10)*10;
      formattedHour = parseInt(formattedHour) + event_had.length;
      endHour = parseInt(formattedHour) + 1;
     } else {
        var time_min = Math.ceil(formattedtime/10)*10;
        formattedHour = parseInt(formattedHour) ;
        endHour = parseInt(formattedHour) + 1;
        }
   } else {
    if(event_had){
      formattedHour = parseInt(formattedHour) + event_had.length ;
      endHour = parseInt(formattedHour) + 1;
      time_min ="00";
     } else {
      formattedHour = parseInt(formattedHour);
      endHour = parseInt(formattedHour) + 1;
      time_min ="00";
     }
  }
  var startDate = formattedDate + formattedHour+":"+time_min+":00";
  var endDate = formattedDate + endHour+":"+time_min+":00";
  
  // you can set and access paramters in the onchange action for further use.
    if(selected_CHECK) {
      //task.setStatus('completed');
      var event = CalendarApp.getDefaultCalendar().createEvent(selected,
      new Date(startDate),
      new Date(endDate));
        } else {
      delEvents('bbbb');
      }
     /* for (i = 0; i < 10; i++){
        if(!event_date[i]){
           event_date[i] = selected;
           break;
        }
       }*/
     /* 
      return CardService.newActionResponseBuilder().setNavigation(
    CardService.newNavigation().updateCard(
      // Build your result card here
    )
  ).build()*/
  
    }

function delEvents(selected) {
  var calendarId = 'primary';
  var optionalArgs = {
    timeMin: (new Date()).toISOString(),
    showDeleted: false,
    singleEvents: true,
    maxResults: 10,
    orderBy: 'startTime'
  };
  var response = Calendar.Events.list(calendarId, optionalArgs);
  var events = response.items;
  if (events.length > 0) {
    for (i = 0; i < events.length; i++) {
      var event = events[i];
      if ( event.summary == selected){
        var delEvent = CalendarApp.getDefaultCalendar().getEventById(event.id); 
        delEvent.deleteEvent();
      } 
    }
  } 
}
