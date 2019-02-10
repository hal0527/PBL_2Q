function GmailAddOn(e) {
  var accessToken = e.messageMetadata.accessToken;
  GmailApp.setCurrentMessageAccessToken(accessToken);
  var section = CardService.newCardSection();
  var messageId = e.messageMetadata.messageId;
  var message = GmailApp.getMessageById(messageId);
  var textbody = message.getPlainBody();
  var title = message.getSubject();
  var url = message.getThread().getPermalink();
  var date,time,place;
  textbody.replace(/((\d{4}年(\d{1,2}月)\d{1,2}日))/g, function ($0) {
    if ($0 && $0 != date) {
       date = $0;
       date = date.replace(/年/g, '/');
       date = date.replace(/月/g, '/');
       date = date.replace(/日/g, '');
     } else {
       date = Utilities.formatDate(new Date(), "JST", "YYYY/MM/dd");
     }
  })
  textbody.replace(/(((\d{1,2}月)\d{1,2}日))/g, function ($0) {
          if ($0 && $0 != date) {
             date = $0;
             year = Utilities.formatDate(new Date(), "JST", "YYYY/");
             date = date.replace(/月/g, '/');
             date = date.replace(/日/g, '');
             date = year + date;
           } else {
             date = Utilities.formatDate(new Date(), "JST", "YYYY/MM/dd");
           }
        })
  if(date == undefined){
    date = Utilities.formatDate(new Date(), "JST", "YYYY/MM/dd");//now
  }
  
  textbody.replace(/(\d{1,2}(:\d{1,2}))/g, function ($0, $1) {
      if(time){
      
      } else{
        if ($0 && $0 != time) {
           time = $1;   
         }
      }
  })
  textbody.replace(/(場所：\w+)/g, function ($0, $1) {
     if(place || place == ''){
      
      } else{
        if ($0) {
           place = $1;   
         } else {
           place = '';
         }
      }
     
  })
  if(place == undefined || null){
    place = '';
  } 
  if(time == undefined || null){
    time = Utilities.formatDate(new Date(), "JST", "HH:mm");
  } 

  //カードの設定                            
  var eventName = CardService.newTextInput()
                             .setFieldName("eventName_input")
                             .setTitle("イベント名前")
                             .setValue(title);
  var memo = CardService.newTextInput()
                        .setFieldName("memo_input")
                        .setValue(place)
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
      var timeCatch = time.substr(0, 2);
      var start_time = i.toFixed() + ':00';
      if(i.toFixed() == Number(timeCatch)){
        timeGroup.addItem(start_time, start_time, false)
                 .addItem(time, time, true);
      } else {
        timeGroup.addItem(start_time, start_time, false);
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
                              .setTitle("イベント時間の長さ")
                              .setFieldName('event_time') //taskDate1.num  
  for(var i = 1; i < 25; i++){//(24 - hour)
      var event_time = i;
      var event_time_name = i + '時間';
      event_timeGroup.addItem(event_time_name, event_time, false);
  }          
 
  var textButton = CardService.newTextButton()
                              .setText("カレンダーに追加する")
                              .setOnClickAction(CardService.newAction()
                                                           .setFunctionName("AddEventGmail"));
  var textParagraph = CardService.newTextParagraph()
    .setText("カレンダーに追加したい項目をチェックしてください。");   
  section.setHeader('<font color="#24998d"><b>メールからカレンダーに追加</b></font>');
  section.addWidget(eventName); 
  section.addWidget(memo);
  section.addWidget(calGroup);
  section.addWidget(event_dateGroup);
  section.addWidget(timeGroup);  
  section.addWidget(event_timeGroup);
  section.addWidget(textButton);
  section.addWidget(email_link);
  
  var card = CardService.newCardBuilder()
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
     var end_hour = time.substr(0,2);
     var end_min= time.substr(2,3);
     end_hour = Number(end_hour) + Number(addEvent_long);
     var endTime = addEvent_Date + " "+ end_hour + end_min;   
     var memo = addEvent_Memo + email_url;
     var event = CalendarApp.getCalendarById(Calendar_Id).createEvent(addEvent_Name,
                                                                      new Date(startTime),
                                                                      new Date(endTime),
                                                                      {description: memo});
                                                                    
  } 
    
  return CardService.newActionResponseBuilder()
                    .setNotification(CardService.newNotification()
                    .setType(CardService.NotificationType.INFO)
                    .setText("イベント追加成功！"))
                    .build();
} 
