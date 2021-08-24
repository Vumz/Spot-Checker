//google analytics 
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-XXXXX-X']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

//load popup contents based on state
chrome.storage.local.get(null, function(result){
  if (!jQuery.isEmptyObject(result)) {
    //starting page state
    document.getElementById(result.exam).click();
    if (document.getElementById('comlex').checked) {
      $(".comlex").slideDown(500);
    } else {
      $(".comlex").slideUp(500);
    }
    document.getElementById('country').selectedIndex = result.country;
    if ((document.getElementById('step1').checked && (document.getElementById('country').selectedIndex == 68)) || (document.getElementById('step2').checked && (document.getElementById('country').selectedIndex == 64)) || (document.getElementById('comlex').checked && (document.getElementById('country').selectedIndex == 4))) {
      stateSelection('USA');
    } else if (document.getElementById('country').selectedIndex == 8 || (document.getElementById('comlex').checked && (document.getElementById('country').selectedIndex == 1))) {
      stateSelection('Canada');
    } else {
      $(".state").slideUp(500);
    }
    document.getElementById('state').selectedIndex = result.state;
    document.getElementById('comlexType').selectedIndex = result.comlexType;
    document.getElementById('location').value = result.location;
    document.getElementById('searchRadius').selectedIndex = result.radius;
    $('#datepicker').datepicker('setDates', result.fDates);
    //error state
    if (result.error) {
      chrome.storage.local.set({cancel: true});
      $('#searchForm :input').prop('disabled', false);
      $('#resetORcancel').text('reset');
      $("#resetORcancel").prop('class', 'btn btn-secondary float-right');
      $('#submit').html('submit')
      //location error
      if (result.errorDetail == 'invalid location') {
        $('#location').addClass('is-invalid');
        $("#formContent").prepend('<p id="error" class="text-danger">Location is invalid.</p>');
        chrome.storage.local.set({errorDetail: ''});
      //page closed error
      } else if (result.errorDetail == 'page closed') {
        $("#formContent").prepend('<p id="error" class="text-danger">The automation page was closed while in use, please try again.</p>');
      //any other error
      } else {
        $("#formContent").prepend('<p id="error" class="text-danger">There was an error, please try again.</p>');
      }
      chrome.storage.local.set({error: false});
    //search completed 
    } else if (result.complete) {
      $(".form").slideUp(500)
      chrome.storage.local.get('matchedDates', function(result){
        $('#datepickerResults').datepicker({
          format: "DD, MM d, yyyy",
            beforeShowDay: function(date){
              var d = date;
              var curr_day = weekdays[d.getDay()];
              var curr_month = months[d.getMonth()];
              var curr_date = d.getDate();
              var curr_year = d.getFullYear();
              var formattedDate = curr_day + ", " + curr_month + " " + curr_date + ", " + curr_year;
              if ($.inArray(formattedDate, result.matchedDates.dates) != -1){
                  return {
                      classes: 'activeClass'
                  };
              }
              return;
            }
        });
      });
      $("#resultsDescription").text('Dates shown below as of ' + result.completionDate);
      $("#results").show()
      _gaq.push(['_trackEvent', 'results', 'clicked']);
    //searching state
    } else if (!result.cancel) {
      $('#searchForm :input').prop('disabled', true);
      $('#submit').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Searching...');
      $('#resetORcancel').prop('disabled', false);
      $('#resetORcancel').text('cancel');
      $("#resetORcancel").prop('class', 'btn btn-danger float-right');
    }
  }
});
//listener for results datepicker selection
$('#datepickerResults').on('changeDate', function() {
  chrome.storage.local.get('matchedDates', function(result){
    let date = $('#datepickerResults').datepicker('getFormattedDate');  
    $("#sites").empty()
    if (date in result.matchedDates) {
      let sites = result.matchedDates[date].sites;
      let distances = result.matchedDates[date].distance;
      for (i = 0; i < sites.length; i++) {
        let siteName = sites[i].split("\n");
        let siteDets = siteName[1] + "\n" + siteName[2] + "\n" + siteName[3];
        $("#sites").append(
          '<li class="list-group-item list-group-item-action flex-column align-items-start"><div class="d-flex w-100 justify-content-between"><h6 class="mb-1 lead">'+ siteName[0] +'</h6><small>'+ distances[i] +'</small></div><p class="mb-1"><small>'+ siteDets +'</small></p></li>');
      }
    }
  });
});
//onclick new search
document.getElementById('newSearch').onclick = event => {
  $(".form").slideDown(500);
  $("#results").hide();
  chrome.browserAction.setBadgeText({text: ''});
  chrome.storage.local.set({
    complete: false,
    cancel: true});
}
//form submission datepicker
$('#datepicker').datepicker({
  multidate: true,
  format: 'm yyyy|DD, MM d, yyyy',
  clearBtn: true,
  multidateSeparator: '+'
});
$('#datepicker').on('changeDate', function() {
    $('#datesHidden').val(
        $('#datepicker').datepicker('getFormattedDate')
    );
});
//onclick for Step 1 selection
document.getElementById('step1').onclick = event => {
  $('#country').empty();
  $('#country').append('<option value="0" disabled>-- No Selection --</option><option value="AFG">AFGHANISTAN</option><option value="ARG">ARGENTINA</option><option value="ARM">ARMENIA</option><option value="AUS">AUSTRALIA</option><option value="BGD">BANGLADESH</option><option value="BOL">BOLIVIA</option><option value="BRA">BRAZIL</option><option value="CAN">CANADA</option><option value="CHL">CHILE</option><option value="CHN">CHINA</option><option value="COL">COLOMBIA</option><option value="CRI">COSTA RICA</option><option value="HRV">CROATIA</option><option value="CYP">CYPRUS</option><option value="CZE">CZECH REPUBLIC</option><option value="DNK">DENMARK</option><option value="DOM">DOMINICAN REPUBLIC</option><option value="EGY">EGYPT</option><option value="FIN">FINLAND</option><option value="FRA">FRANCE</option><option value="DEU">GERMANY</option><option value="GHA">GHANA</option><option value="GRC">GREECE</option><option value="GUM">GUAM</option><option value="GTM">GUATEMALA</option><option value="HTI">HAITI</option><option value="HND">HONDURAS</option><option value="HKG">HONG KONG</option><option value="HUN">HUNGARY</option><option value="IND">INDIA</option><option value="IDN">INDONESIA</option><option value="IRL">IRELAND</option><option value="ISR">ISRAEL</option><option value="ITA">ITALY</option><option value="JPN">JAPAN</option><option value="JOR">JORDAN</option><option value="KEN">KENYA</option><option value="KOR">KOREA, REPUBLIC OF</option><option value="KWT">KUWAIT</option><option value="LBN">LEBANON</option><option value="LTU">LITHUANIA</option><option value="MYS">MALAYSIA</option><option value="MUS">MAURITIUS</option><option value="MEX">MEXICO</option><option value="NPL">NEPAL</option><option value="NLD">NETHERLANDS</option><option value="NZL">NEW ZEALAND</option><option value="OMN">OMAN</option><option value="PAK">PAKISTAN</option><option value="PER">PERU</option><option value="PHL">PHILIPPINES</option><option value="PRT">PORTUGAL</option><option value="PRI">PUERTO RICO</option><option value="QAT">QATAR</option><option value="SAU">SAUDI ARABIA</option><option value="SGP">SINGAPORE</option><option value="ZAF">SOUTH AFRICA</option><option value="ESP">SPAIN</option><option value="LKA">SRI LANKA</option><option value="CHE">SWITZERLAND</option><option value="TWN">TAIWAN</option><option value="THA">THAILAND</option><option value="TTO">TRINIDAD AND TOBAGO</option><option value="TUR">TURKEY</option><option value="UGA">UGANDA</option><option value="ARE">UNITED ARAB EMIRATES</option><option value="GBR">UNITED KINGDOM</option><option selected="selected" value="USA">UNITED STATES</option><option value="VEN">VENEZUELA</option><option value="VIR">VIRGIN ISLANDS (U.S.)</option><option value="ZWE">ZIMBABWE</option>');
  stateSelection('USA');
  $(".comlex").slideUp(500);
}
//onclick for Step 2 selection
document.getElementById('step2').onclick = event => {
  $('#country').empty();
  $('#country').append('<option value="0" disabled>-- No Selection --</option><option value="AFG">AFGHANISTAN</option><option value="ARG">ARGENTINA</option><option value="ARM">ARMENIA</option><option value="AUS">AUSTRALIA</option><option value="BGD">BANGLADESH</option><option value="BOL">BOLIVIA</option><option value="BRA">BRAZIL</option><option value="CAN">CANADA</option><option value="CHL">CHILE</option><option value="CHN">CHINA</option><option value="COL">COLOMBIA</option><option value="CRI">COSTA RICA</option><option value="HRV">CROATIA</option><option value="CYP">CYPRUS</option><option value="CZE">CZECH REPUBLIC</option><option value="DOM">DOMINICAN REPUBLIC</option><option value="EGY">EGYPT</option><option value="FIN">FINLAND</option><option value="FRA">FRANCE</option><option value="DEU">GERMANY</option><option value="GHA">GHANA</option><option value="GRC">GREECE</option><option value="GUM">GUAM</option><option value="GTM">GUATEMALA</option><option value="HKG">HONG KONG</option><option value="IND">INDIA</option><option value="IDN">INDONESIA</option><option value="IRL">IRELAND</option><option value="ISR">ISRAEL</option><option value="ITA">ITALY</option><option value="JPN">JAPAN</option><option value="JOR">JORDAN</option><option value="KEN">KENYA</option><option value="KOR">KOREA, REPUBLIC OF</option><option value="KWT">KUWAIT</option><option value="LBN">LEBANON</option><option value="LTU">LITHUANIA</option><option value="MYS">MALAYSIA</option><option value="MUS">MAURITIUS</option><option value="MEX">MEXICO</option><option value="NPL">NEPAL</option><option value="NLD">NETHERLANDS</option><option value="NZL">NEW ZEALAND</option><option value="OMN">OMAN</option><option value="PAK">PAKISTAN</option><option value="PER">PERU</option><option value="PHL">PHILIPPINES</option><option value="PRT">PORTUGAL</option><option value="PRI">PUERTO RICO</option><option value="QAT">QATAR</option><option value="SAU">SAUDI ARABIA</option><option value="SGP">SINGAPORE</option><option value="ZAF">SOUTH AFRICA</option><option value="ESP">SPAIN</option><option value="LKA">SRI LANKA</option><option value="CHE">SWITZERLAND</option><option value="TWN">TAIWAN</option><option value="THA">THAILAND</option><option value="TTO">TRINIDAD AND TOBAGO</option><option value="TUR">TURKEY</option><option value="UGA">UGANDA</option><option value="ARE">UNITED ARAB EMIRATES</option><option value="GBR">UNITED KINGDOM</option><option value="USA" selected>UNITED STATES</option><option value="VEN">VENEZUELA</option><option value="VIR">VIRGIN ISLANDS (U.S.)</option><option value="ZWE">ZIMBABWE</option>');
  stateSelection('USA');
  $(".comlex").slideUp(500);
}
//onclick for COMLEX selection
document.getElementById('comlex').onclick = event => {
  $('#country').empty();
  $('#country').append('<option value="0" disabled>-- No Selection --</option><option value="CAN">CANADA</option><option value="GUM">GUAM</option><option value="PRI">PUERTO RICO</option><option selected value="USA">UNITED STATES</option><option value="VIR">VIRGIN ISLANDS (U.S.)</option>');
  stateSelection('USA');
  $(".comlex").slideDown(500);
}
//listener for country selection 
var countrySelection = document.getElementById('country');
countrySelection.addEventListener( 'change', function() {
  if((document.getElementById('step1').checked && (this.selectedIndex == 68)) || (document.getElementById('step2').checked && (this.selectedIndex == 64)) || (document.getElementById('comlex').checked && (document.getElementById('country').selectedIndex == 4))) {
    stateSelection('USA');
  } else if (this.selectedIndex == 8 || (document.getElementById('comlex').checked && (document.getElementById('country').selectedIndex == 1))) {
    stateSelection('Canada');
  } else {
    $(".state").slideUp(500);
  }
});
//helper for US vs Canada state population
function stateSelection(country) {
  $('#state').empty();
  if (country == 'USA') {
    $('#state').append('<option value="0" disabled>-- No Selection --</option><option value="AL">Alabama</option><option value="AK">Alaska</option><option value="AZ">Arizona</option><option value="AR">Arkansas</option><option value="CA" selected>California</option><option value="CO">Colorado</option><option value="CT">Connecticut</option><option value="DE">Delaware</option><option value="FL">Florida</option><option value="GA">Georgia</option><option value="GU">Guam</option><option value="HI">Hawaii</option><option value="ID">Idaho</option><option value="IL">Illinois</option><option value="IN">Indiana</option><option value="IA">Iowa</option><option value="KS">Kansas</option><option value="KY">Kentucky</option><option value="LA">Louisiana</option><option value="ME">Maine</option><option value="MD">Maryland</option><option value="MA">Massachusetts</option><option value="MI">Michigan</option><option value="MN">Minnesota</option><option value="MS">Mississippi</option><option value="MO">Missouri</option><option value="MT">Montana</option><option value="NE">Nebraska</option><option value="NV">Nevada</option><option value="NH">New Hampshire</option><option value="NJ">New Jersey</option><option value="NM">New Mexico</option><option value="NY">New York</option><option value="NC">North Carolina</option><option value="ND">North Dakota</option><option value="OH">Ohio</option><option value="OK">Oklahoma</option><option value="OR">Oregon</option><option value="PA">Pennsylvania</option><option value="PR">Puerto Rico</option><option value="RI">Rhode Island</option><option value="SC">South Carolina</option><option value="SD">South Dakota</option><option value="TN">Tennessee</option><option value="TX">Texas</option><option value="UT">Utah</option><option value="VT">Vermont</option><option value="VI">Virgin Islands</option><option value="VA">Virginia</option><option value="WA">Washington</option><option value="DC">Washington DC</option><option value="WV">West Virginia</option><option value="WI">Wisconsin</option><option value="WY">Wyoming</option></select>');
  } else if (country == 'Canada') {
    $('#state').append('<option value="0" disabled>-- No Selection --</option><option value="AB" selected>Alberta</option><option value="BC">British Columbia</option><option value="MB">Manitoba</option><option value="NB">New Brunswick</option><option value="NF">Newfoundland</option><option value="NT">Northwest Territories</option><option value="NS">Nova Scotia</option><option value="NU">Nunavut</option><option value="ON">Ontario</option><option value="PE">Prince Edward Island</option><option value="QC">Quebec</option><option value="SK">Saskatchewan</option><option value="YK">Yukon</option></select>');
  }
  $(".state").slideDown(500);
}
//listener for 3 month fill checkbox
var checkbox = document.getElementById('3monthCheck');
var blockMonths = [];
var today = new Date();
for (i = 0; i < 90; i++) {
  blockMonths.push(new Date(today.getFullYear(), today.getMonth(), today.getDate() + i));
}
checkbox.addEventListener( 'change', function() {
    if(this.checked) {
      $('#datepicker').datepicker('setDates', blockMonths);
    } else {
      $('#datepicker').datepicker('setDates', null);
    }
});
//form submission
document.getElementById('searchForm').onsubmit = event => {
  event.preventDefault();
  if (document.getElementById('location').value) {
    chrome.browserAction.setBadgeText({text: ''});
    $('#location').removeClass('is-invalid');
    $("#error").empty()
    var exam = 'step1';
    if (document.getElementById('step2').checked) {
      exam = 'step2';
    } else if (document.getElementById('comlex').checked) {
      exam = 'comlex';
    }
    const country = document.getElementById('country').selectedIndex;
    const state = document.getElementById('state').selectedIndex;
    const comlexType = document.getElementById('comlexType').selectedIndex;
    const location = document.getElementById('location').value;
    const radius = document.getElementById('searchRadius').selectedIndex;
    const fDates = document.getElementById('datesHidden').value.split('+');
    var months = [];
    const dates = [];
    for (var i = 0, date; date = fDates[i]; i++) {
      let split = date.split('|');
      months.push(split[0]);
      dates.push(split[1]);
    }
    months = months.filter(function(item, pos) {
      return months.indexOf(item) == pos;
    })
    _gaq.push(['_trackEvent', 'search', 'clicked']);

    chrome.storage.local.set({
      cancel: false,
      complete: false,
      exam: exam,
      country: country,
      state: state,
      comlexType: comlexType,
      location: location,
      radius: radius,
      fDates: fDates,
    });

    chrome.runtime.sendMessage({
      source: "popup",
      cancel: false,
      exam: exam,
      country: country,
      state: state,
      comlexType: comlexType,
      location: location,
      radius: radius,
      fDates: fDates,
      months: months,
      dates: dates
    });
  //if location not entered don't submit
  } else {
    $('#location').addClass('is-invalid');
  }
}
//onclick reset/cancel button
document.getElementById('resetORcancel').onclick = event => {
  //cancel button
  if ($('#resetORcancel').text() == 'cancel') {
    chrome.runtime.sendMessage({
        source: "popupCancel",
        cancel: true
      });
    chrome.storage.local.set({cancel: true});
    $('#searchForm :input').prop('disabled', false);
    $('#resetORcancel').text('reset');
    $("#resetORcancel").prop('class', 'btn btn-secondary float-right');
    $('#submit').html('submit');
  //reset button
  } else {
    $('#location').removeClass('is-invalid');
    $("#error").empty();
    $('#datepicker').datepicker('setDates', null)
    $('#searchForm')[0].reset();
    $(".state").slideDown(500);
    chrome.storage.local.clear();
  }
}
//donate button redirect
document.getElementById('donate').onclick = event => {
  _gaq.push(['_trackEvent', 'donate', 'clicked']);
  setTimeout(
    function() 
    {
      chrome.tabs.create({url : 'https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=TKB3JATRWVGNU&item_name=Please+consider+donating+if+you+found+USMLE+Spot+Checker+helpful%21&currency_code=USD&source=url'});
    }, 500);
}
//feedback button redirect
document.getElementById('feedback').onclick = event => {
  _gaq.push(['_trackEvent', 'feedback', 'clicked']);
  setTimeout(
    function() 
    {
      chrome.tabs.create({url : 'https://docs.google.com/forms/d/e/1FAIpQLSe-RBfxIwx_wBdnw0agS6zNBL3z2gWg2uJiKOPuxTllIynWkw/viewform?usp=sf_link'});
    }, 500);
}