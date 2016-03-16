// Userlist data array for filling in info box
var athlete = null;
var sessions = [];

// DOM Ready =============================================================
$(document).ready(function () {
    
    // Search Email button click
    $('#btnSearchEmail').on('click', searchEmail);
    
    // Choose a session
    $('#btnChooseSession').on('click', chooseSession);
    
    $("#datepick").datepicker({ dateFormat: 'yy-mm-dd' });
    
    hideDashboard('userList');
    hideDashboard('addUser');
});

// Functions =============================================================

function showDashboard(part) {
    var page = document.getElementById(part);
    page.style.visibility = 'visible';
    page.style.display = 'block';
}

function hideDashboard(part) {
    var page = document.getElementById(part);
    page.style.visibility = 'hidden';
    page.style.display = 'none';
}

function chooseSession(event) {
    event.preventDefault();
    var date = $('#addUser input#datepick').val();
    var hour = $('#addUser input#sessionHour:checked').val();
    var data = {};
    data.date = date;
    data.hour = hour;
    data.athleteId = athlete.id;
    JSON.stringify(data);
    // Use AJAX to post the session date and hour
    $.ajax({
        type: 'POST',
        data: data,
        url: '/users/athletesession',
        dataType: 'JSON'
    }).done(function (response) {
        // Check for successful (blank) response
        if (response.msg === '') {
            // Update the view
            populateDashboard();
        }
        else {
            // If something goes wrong, alert the error message that our service returned
            alert('Error: ' + response.msg);
        }
    });
};

// Fill table with data
function populateDashboard() {
    
    $('#athleteName').text(athlete.fullname);
    
    // Empty content string
    var tableContent = '';
    
    var url = '/users/sessions/' + athlete.id;
    // jQuery AJAX call for JSON
    $.getJSON(url, function (data) {
        
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function () {
            tableContent += '<tr>';
            tableContent += '<td>' + this.hour + '</td>';
            tableContent += '<td>' + this.datetime + '</td>';
            tableContent += '</tr>';
        });
        
        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
    });
    showDashboard('userList');
    showDashboard('addUser');
};

// Search Email
function searchEmail(event) {
    event.preventDefault();
    var emailVal = $('#userInfo input#inputUserEmail').val();
    if (emailVal != '') {
        var data = {};
        data.email = emailVal;
        JSON.stringify(data);
        // Use AJAX to post the email to our search service
        $.ajax({
            type: 'POST',
            data: data,
            url: '/users/search',
            dataType: 'JSON'
        }).done(function (response) {
            // Check for successful (non-blank) response
            if (response.length === 1) {
                athlete = response[0];
                console.log(athlete.fullname);
                populateDashboard();
            }
            else {
                // If something goes wrong, alert the error message that our service returned
                alert('Unable to find user: ' + emailVal);
                hideDashboard('userList');
                hideDashboard('addUser');
            }
        });
    }
};

// Show User Info - NOT USED
function showUserInfo(event) {
    
    // Prevent Link from Firing
    event.preventDefault();
    
    // Retrieve username from link rel attribute
    var thisFullName = $(this).attr('rel');
    
    // Get Index of object based on id value
    var arrayPosition = userListData.map(function (arrayItem) { return arrayItem.fullname; }).indexOf(thisFullName);
    
    // Get our User Object
    var thisUserObject = userListData[arrayPosition];
    
    //Populate Info Box
    $('#userInfoName').text(thisUserObject.fullname);
    $('#userInfoAge').text(thisUserObject.age);
    $('#userInfoGender').text(thisUserObject.gender);
    $('#userInfoPhone').text(thisUserObject.phone);

};

// Add User - NOT USED REMOVE
function addUser(event) {
    event.preventDefault();
    
    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addUser input').each(function (index, val) {
        if ($(this).val() === '') { errorCount++; }
    });
    
    // Check and make sure errorCount's still at zero
    if (errorCount === 0) {
        
        // If it is, compile all user info into one object
        var newUser = {
            'email': $('#addUser fieldset input#inputUserEmail').val(),
            'fullname': $('#addUser fieldset input#inputUserFullname').val(),
            'dob': $('#addUser fieldset input#inputUserDob').val(),
            'age': $('#addUser fieldset input#inputUserAge').val(),
            'gender': $('#addUser fieldset input#inputUserGender').val(),
            'phone': $('#addUser fieldset input#inputUserPhone').val()
        }
        
        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/adduser',
            dataType: 'JSON'
        }).done(function (response) {
            
            // Check for successful (blank) response
            if (response.msg === '') {
                
                // Clear the form inputs
                $('#addUser fieldset input').val('');
                
                // Update the table
                populateTable();

            }
            else {
                
                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);

            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
};

// Delete User
function deleteUser(event) {
    
    event.preventDefault();
    
    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');
    
    // Check and make sure the user confirmed
    if (confirmation === true) {
        
        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/users/deleteuser/' + $(this).attr('rel')
        }).done(function (response) {
            
            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }
            
            // Update the table
            populateTable();

        });

    }
    else {
        
        // If they said no to the confirm, do nothing
        return false;

    }

};