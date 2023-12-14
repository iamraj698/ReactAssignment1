# Node Packages Which Are Used In This Application
1.react-router-dom,
2.jwt-decode:To Decode Response token which is generated when  user sign in.( npm i jwt-decode)
3.chart.js:Used Create The charts for Analysing the application( npm i chart.js)
4.bootstrap,
5.react-bootstrap,

# Instructions to Run The Application
Since I am using the test gmail account to login the application Only Specified Test User able to login the application
Here I am providing the credentials for the test Gmail which I have added while creating the project in the google's developeer console.

mail id: testmailutility123@gmail.com
password: #Testmail309.

we have to re login with the same email to fetch the gmail apis to get the sent inbox emails because after the first login we only get the response which includes the use information and in that user information we get a user id using that id we can able to request an response in which we get the access tokens and the refesh token which are mandatory for the acccessing the information in the gmail application.