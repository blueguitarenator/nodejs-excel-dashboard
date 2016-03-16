// Userlist data array for filling in info box
var athlete = null;
var sessions = [];

// DOM Ready =============================================================
$(document).ready(function () {
    
    // Search Email button click
    $('#btnSearchEmail').on('click', searchEmail);
    
    // Choose a session
    $('#btnChooseSession').on('click', chooseSession);
    
    // Delete User session link click
    $('#userList table tbody').on('click', 'td a.linkdeleteusersession', deleteUserSession);
    
    $("#datepick").datepicker({
        dateFormat: 'yy-mm-dd'
    }).datepicker('setDate', new Date());

    $("#datepick").datepicker().on("change", function () {
        changeDate();
    });
    
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

function changeDate() {
    var byDate = $('#addUser input#datepick').val();
    // Empty content string
    var tableContent = '';
    
    var url = '/users/sessionsbydate/' + byDate;
    // jQuery AJAX call for JSON
    $.getJSON(url, function (data) {
        var six = [];
        var seven = [];
        var eight = [];
        var nine = [];
        var ten = [];
        var sixteen = [];
        var seventeen = [];
        var eighteen = [];
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function () {
            if (this.hour === 6) {
                six.push(this.fullname);
            }
            else if (this.hour === 7) {
                seven.push(this.fullname);
            }
            else if (this.hour === 8) {
                eight.push(this.fullname);
            }
            else if (this.hour === 9) {
                nine.push(this.fullname);
            }
            else if (this.hour === 10) {
                ten.push(this.fullname);
            }
            else if (this.hour === 16) {
                sixteen.push(this.fullname);
            }
            else if (this.hour === 17) {
                seventeen.push(this.fullname);
            }
            else if (this.hour === 18) {
                eighteen.push(this.fullname);
            }
        });

        tableContent += populateSessionRow('6am', six);
        tableContent += populateSessionRow('7am', seven);
        tableContent += populateSessionRow('8am', eight);
        tableContent += populateSessionRow('9am', nine);
        tableContent += populateSessionRow('10am', ten);
        tableContent += populateSessionRow('11am', null);
        tableContent += populateSessionRow('12pm', null);
        tableContent += populateSessionRow('1pm', null);
        tableContent += populateSessionRow('2pm', null);
        tableContent += populateSessionRow('3pm', null);
        tableContent += populateSessionRow('4pm', sixteen);
        tableContent += populateSessionRow('5pm', seventeen);
        tableContent += populateSessionRow('6pm', eighteen);
        
        // Inject the whole content string into our existing HTML table
        $('#sessions table tbody').html(tableContent);
    });
}

function populateSessionRow(displayText, map, rowCount) {
    var tableContent = '';
    if (map === null) {
        tableContent += '<tr><td>' + displayText + '</td>';
        tableContent += '<td>open</td>';
        tableContent += '<td>open</td>';
        tableContent += '<td>open</td>';
        tableContent += '<td>open</td>';
        tableContent += '<td>open</td></tr>';
    } else {
        var count = map.length;
        
        for (i = 0; i < 24; i++) {
            if (i === 0) {
                tableContent += '<tr><td>' + displayText + '</td>';
            }
            else if (i % 6 === 0) {
                tableContent += '</tr><tr><td></td>';
            }
            else if (i > 0) {
                if (count + 1 > i) {
                    tableContent += '<td>' + map[i-1] + '</td>';
                } else {
                    tableContent += '<td>open</td>';
                }
            }
        }
        tableContent += '</tr>';
    }
    
    return tableContent;
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
            tableContent += '<td><a href="#" class="linkdeleteusersession" rel="' + this.sessionId + '">delete</a></td>';
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

// Delete User
function deleteUserSession(event) {
    
    event.preventDefault();
    
    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete yourself from this session?');
    
    // Check and make sure the user confirmed
    if (confirmation === true) {
        
        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/users/delete/' + athlete.id + '/session/' + $(this).attr('rel')
        }).done(function (response) {
            
            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }
            
            // Update the table
            populateDashboard();

        });
    }
    else {
        // If they said no to the confirm, do nothing
        return false;
    }
};