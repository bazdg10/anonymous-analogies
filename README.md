# anonymous-analogies
# Node Js | Socket-IO | MongoDB

Schema <br />
User             |            Room <br />
<br />
<br />
<br />
User Schema<br />
>  email <br/>
  score    *Total Score of User* <br /> 
  tempId    * Socket-Id of User* <br />
  room: *Room name of user*<br />
  lastScore: *Score of user in last game* -> DATA RETRIEVE
  
User leaves room =>  lastScore is saved as per data from Room. User's tempId and room are revoked.<br />


Room Schema<br />
>  name<br />
  game<br />
  rounds<br />
  dummy     *stores player's email - Data retrieval*<br /> 
  scores<br />
  players     *stores player's socket-id* <br />
  analogy    *stores index of last analogy* <br />  
  assigned *stores last assigned player*<br />
  responses<br />
  votes<br />
  
User leaves room =>  player leaves the room and we just remove person's socket id and score from the room and keep his email for retrieval purpose <br />
