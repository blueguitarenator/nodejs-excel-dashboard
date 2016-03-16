// Userlist data array for filling in info box
var athlete = null;
var sessions = [];

// DOM Ready =============================================================
$(document).ready(function () {
    
    // Search Email button click
    $('#btnSearchEmail').on('click', searchEmail);
    
    // Choose a session
    $('#btnChooseSession').on('click', chooseSession);
    
    $('#datepick').datepicker({ dateFormat: 'yy-mm-dd' });

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

function changeDate(newDate) {
    alert("Date changed " + $('#addUser input#datepick').val());
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
