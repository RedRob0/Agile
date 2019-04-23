var attempt = 5;

function validate(){
    var username = document.getElementById("Username").value;
    var password = document.getElementById("Password").value;
    if (username == something && password == something ){
        alert ("Login successfully");
        window.location = "success.html";
        return false;
    }else{
        attempt --;
        alert("You have left "+attempt+" attempt;");

        if( attempt == 0){
            document.getElementById("username").disabled = true;
            document.getElementById("password").disabled = true;
            document.getElementById("submit").disabled = true;
            return false;
        }
    }
}

function addAccount(){

}