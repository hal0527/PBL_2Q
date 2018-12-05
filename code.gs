function Cal2TodoAddOn(e) {
  var taskList = TaskListData();
  var cards = []; 
  if (taskList.length > 0) {
    taskList.forEach(function(listData) {
      cards.push(BuildCardTask(listData));
    });
  } else {
    cards.push(CardService.newCardBuilder()
                          .setHeader(CardService.newCardHeader()
                                                .setTitle('No Tasklist from Google Tasks')).build());
  }
  return cards;
}

function TaskListData() {
  var taskLists = Tasks.Tasklists.list().getItems();
  var recents = [];
  taskLists.forEach(function(taskList) {
    recents.push({
      'id': taskList.getId(),
      'name': taskList.getTitle(),
      'updated': taskList.getUpdated()
    });
  });
  return recents;
}

function TaskData(listDataID){
  var tasks = Tasks.Tasks.list(listDataID).getItems();
  var recents = [];
  tasks.forEach(function(task) {
    recents.push({
      'id': task.getId(),
      'name': task.getTitle(),
      'status': task.getStatus()
    });
  });
  return recents;
}

function BuildCardTask(listData){
  var taskData = TaskData(listData.id);
  var card = CardService.newCardBuilder();
  var updateDate = listData.updated;
  var updateTime = updateDate.substr(11 , 5);
  updateDate = updateDate.substr(0 , 10);
  card.setHeader(CardService.newCardHeader().setTitle(listData.name)
                                            .setSubtitle('更新時間：' + updateDate + ' ' + updateTime)
                                            .setImageStyle(CardService.ImageStyle.SQUARE)
                                            .setImageUrl("http://icons.iconarchive.com/icons/icons8/ios7/128/User-Interface-Checklist-icon.png"));
  var section = CardService.newCardSection();
  
  if (taskData) {
    var checkboxGroup = CardService.newSelectionInput()
                                   .setType(CardService.SelectionInputType.CHECK_BOX)
                                   .setFieldName('check_box');
    for (var i = 0; i <= taskData.length-1; i++) {
      var taskData1 = taskData[i];
      if(taskData1.status == 'needsAction'){
        checkboxGroup.addItem(taskData1.name, taskData1.name, false);
      }
    }
  }
  var date = Utilities.formatDate(new Date(), "JST", "MMMMM d',' yyyy ");
  var dropdownGroup = CardService.newSelectionInput()
                                 .setType(CardService.SelectionInputType.DROPDOWN)
                                 .setTitle('日付け')
                                 .setFieldName('date') //
                                 .addItem(date, date, true);
  for(var i = 1; i <= 9; i++){
    var dateChange = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * i);
    var date1 = Utilities.formatDate(dateChange, "JST", "MMMMM d',' yyyy ");
    dropdownGroup.addItem(date1, date1, false);
  }  
  var hour = Utilities.formatDate(new Date(), "JST", "HH");
  var dropdownGroup2 = CardService.newSelectionInput()
                                  .setType(CardService.SelectionInputType.DROPDOWN)
                                  .setTitle("時")
                                  .setFieldName('hour') //taskDate1.num
                                  .addItem(hour, hour, true);  
  for(var i = 1; i <= 23; i++){//(24 - hour)
    var hour = Utilities.formatDate(new Date(), "JST", "HH");
    var hourChange = new Date(new Date().getTime() + 1000 * 60 * 60 * i);
    var hour1 = Utilities.formatDate(hourChange, "JST", "HH");
    dropdownGroup2.addItem(hour1, hour1, false);
  }
  
  var min = Utilities.formatDate(new Date(), "JST", "mm");
  var test = Math.ceil(min/10)*10;
  var dropdownGroup3 = CardService.newSelectionInput()
                                  .setType(CardService.SelectionInputType.DROPDOWN)
                                  .setTitle("分")
                                  .setFieldName('min');//taskDate1.num
  for(var i = 0; i <=5; i++){ //(60 - min)
    var minChange = new Date(new Date().getTime() + 1000 * 60 * 10 * i);
    var time_min = Utilities.formatDate(minChange, "JST", "mm");
    var min1 = Math.ceil(time_min/10)*10;
    if(min1==60)var min1=00;
    var min1 = min1.toFixed();
    dropdownGroup3.addItem(min1, min1, false);
  }
  var textButton1 = CardService.newTextButton()
                              .setText("OK")
                              .setOnClickAction(CardService.newAction()
                                                           .setFunctionName("AddEventTask"));
  var textButton2 = CardService.newTextButton()
                              .setText("Open Calendar Link")
                              .setOpenLink(CardService.newOpenLink()
                                                      .setUrl("https://calendar.google.com/calendar/r"));
  var calNum = CalendarApp.getAllCalendars();
  var calname0 = CalendarApp.getDefaultCalendar().getName();
  var calGroup = CardService.newSelectionInput()
                              .setType(CardService.SelectionInputType.DROPDOWN)
                              .setTitle("カレンダー")
                              .setFieldName('calendar_name') //taskDate1.num
                              .addItem(calname0, calname0, true);
  for(var i = 0; i < calNum.length; i++){
      var event = CalendarApp.getAllCalendars();
      var calname = calNum[i].getName();
      var claid = calNum[i].getId();
      if(calname !== calname0){
        calGroup.addItem(calname, claid, false);
      }
  }     
  section.addWidget(checkboxGroup);
  section.addWidget(dropdownGroup);
  section.addWidget(dropdownGroup2);
  section.addWidget(dropdownGroup3);
  section.addWidget(calGroup);
  section.addWidget(textButton1);  
  section.addWidget(textButton2);                                                    
  
  card.addSection(section);
  return card.build();
}

function AddEventTask(e){
  var selected_check = !!e.formInput.check_box;
  var create_data = e.formInputs.check_box;
  var add_date = e.formInputs.date;
  var add_hour = e.formInputs.hour;
  var add_min = e.formInputs.min;
  var end_hour;
  var now = new Date();
  var fiveHoursFromNow = new Date(now.getTime() + (5 * 60 * 60 * 1000));
  var event_had = CalendarApp.getDefaultCalendar().getEvents(now, fiveHoursFromNow);
  var calendar_id = e.formInputs.calendar_name;
  
  if(add_min <= 50){
    if(event_had){
      var time_min = Math.ceil(add_min/10)*10;
      add_hour = parseInt(add_hour) + event_had.length;
      end_hour = parseInt(add_hour) + 1;
    } else {
      var time_min = Math.ceil(add_min/10)*10;
      add_hour = parseInt(add_hour) ;
      end_hour = parseInt(add_hour) + 1;
    }
  } else {
    if(event_had){
      add_hour = parseInt(add_hour) + event_had.length ;
      end_hour = parseInt(add_hour) + 1;
      time_min ="00";
    } else {
      add_hour = parseInt(add_hour);
      end_hour = parseInt(add_hour) + 1;
      time_min ="00";
    }
  }
  var startDate = add_date + add_hour+":"+time_min;
  var endDate = add_date + end_hour+":"+time_min;
  if(selected_check) {
    for(i = 0; i < create_data.length;i++){
      var eventName = create_data[i];
      if(eventName !== 'null'){
        var startDate = add_date + parseInt(add_hour+i)+":"+time_min;
        var endDate = add_date + parseInt(end_hour+i)+":"+time_min;
        var event = CalendarApp.getCalendarById(calendar_id).createEvent(eventName,
                                                                         new Date(startDate),
                                                                         new Date(endDate));
      }
    }
    return CardService.newActionResponseBuilder()
                      .setNotification(CardService.newNotification()
                                                  .setType(CardService.NotificationType.INFO)
                                                  .setText("Added to Calendar!"))
                      .build();
  }
}

function GmailAddOn(e) {
  var accessToken = e.messageMetadata.accessToken;
  GmailApp.setCurrentMessageAccessToken(accessToken);
  var section = CardService.newCardSection();
  var messageId = e.messageMetadata.messageId;
  var message = GmailApp.getMessageById(messageId);
  var textbody = message.getPlainBody();
  var title = message.getSubject();
  var url = message.getThread().getPermalink();
  var date,time;
  textbody.replace(/((\d{4}年(\d{1,2}月)\d{1,2}日))/g, function ($0) {
    if ($0 && $0 != date) {
       date = $0;
       date = date.replace(/年/g, '/');
       date = date.replace(/月/g, '/');
       date = date.replace(/日/g, '');
     } else {
       date = '2018/12/12';
     }
  })
  if(date == undefined){
    date = Utilities.formatDate(new Date(), "JST", "YYYY/MM/DD");//now
  }
  
  if(time == undefined){
    time = Utilities.formatDate(new Date(), "JST", "HH:mm");
  }
  textbody.replace(/(\d{1,2}(:\d{1,2}))/g, function ($0) {
    if ($0 && $0 != time) {
       time = $0;
     }
  })
  textbody.replace(); 
  //カードの設定                            
  var eventName = CardService.newTextInput()
                             .setFieldName("eventName_input")
                             .setTitle("イベント名前")
                             .setValue(title);
  var memo = CardService.newTextInput()
                        .setFieldName("memo_input")
                        .setTitle("メモ");
  var email_link = CardService.newTextInput()
                              .setFieldName("email_link")
                              .setTitle("リンク")
                              .setValue(url);                         
  var event_date = date.toString();
  var event_dateGroup = CardService.newTextInput()
                                   .setFieldName("date")
                                   .setTitle("日付け")
                                   .setValue(event_date);                                                        
  var timeGroup = CardService.newSelectionInput()
                             .setType(CardService.SelectionInputType.DROPDOWN)
                             .setTitle("時間")
                             .setFieldName('time') //taskDate1.num
  
  for(var i = 0; i < 24; i++){//(24 - hour)
      var timeChange = time.substr(0, 2);
      var time1 = i;
    time1=time1.toFixed();
      if(time1 == timeChange){
        timeGroup.addItem(time1+":00", time1, false)
                 .addItem(time, time, true);
      } else {
        timeGroup.addItem(time1, time1, false);
      }
  }                                                             
  
  var calNum = CalendarApp.getAllCalendars();
  var calname0 = CalendarApp.getDefaultCalendar().getName();
  var calGroup = CardService.newSelectionInput()
                              .setType(CardService.SelectionInputType.DROPDOWN)
                              .setTitle("カレンダー")
                              .setFieldName('calendar_name') //taskDate1.num
                              .addItem(calname0, calname0, true);
  for(var i = 0; i < calNum.length; i++){
      var event = CalendarApp.getAllCalendars();
      var calname = calNum[i].getName();
      var claid = calNum[i].getId();
      if(calname !== calname0){
        calGroup.addItem(calname, claid, false);
      }
  }                     
  
  var event_timeGroup = CardService.newSelectionInput()
                              .setType(CardService.SelectionInputType.DROPDOWN)
                              .setTitle("イベント時長")
                              .setFieldName('event_time') //taskDate1.num  
  for(var i = 1; i < 25; i++){//(24 - hour)
      var event_time = i;
      var event_time_name = i + '時間';
      event_timeGroup.addItem(event_time_name, event_time, false);
  }          
 
  var textButton = CardService.newTextButton()
                              .setText("追加する")
                              .setOnClickAction(CardService.newAction()
                                                           .setFunctionName("AddEventGmail"));
                                                         
  section.addWidget(eventName); 
  section.addWidget(memo);
  section.addWidget(calGroup);
  section.addWidget(event_dateGroup);
  section.addWidget(timeGroup);  
  section.addWidget(event_timeGroup);
  section.addWidget(textButton);
  section.addWidget(email_link);
  
  var card = CardService.newCardBuilder()
                        .setHeader(CardService.newCardHeader()
                                              .setTitle('<font color="#ea9999">イベント追加</font>'))
                        .addSection(section)
                        .build();
  return CardService.newUniversalActionResponseBuilder()
                    .displayAddOnCards([card])
                    .build();
}

function AddEventGmail(e){
  var addEvent_Name = e.formInputs.eventName_input;
  var addEvent_Memo = e.formInputs.memo_input;
  var addEvent_Date = e.formInputs.date;
  var addEvent_Time = e.formInputs.time;
  var addEvent_long = e.formInputs.event_time;
  var Calendar_Id = e.formInputs.calendar_name;
  var email_url = e.formInputs.email_link;
  var endHour;  
  email_url = email_url.toString();
  if(addEvent_Name !== 'null'){
     var startTime = addEvent_Date + " " + addEvent_Time;
     var time = addEvent_Time.toString();
     time = time.substr(0,2);
     time = Number(time) + Number(addEvent_long);
     var endTime = addEvent_Date + " "+ time + ":00";   
     var memo = addEvent_Memo + email_url;
     var event = CalendarApp.getCalendarById(Calendar_Id).createEvent(addEvent_Name,
                                                                      new Date(startTime),
                                                                      new Date(endTime),
                                                                      {description: memo});
  } 
    
  return CardService.newActionResponseBuilder()
                    .setNotification(CardService.newNotification()
                    .setType(CardService.NotificationType.INFO)
                    .setText("イベント追加成功"))
                    .build();
} 