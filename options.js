let option_page = document.getElementById("options-div");

/// Construct input field. YYYY-MM-DD
function construct_input_field(append_position, id, value) {
  let input_field = document.createElement("input");
  input_field.id = id;
  input_field.name = id;
  input_field.value = value;
  append_position.appendChild(input_field);
}

/// Construct submit button.
function construct_submit_button(append_position, id, callback) {
  let submit_button = document.createElement("button");
  submit_button.id = id;
  submit_button.name = id;
  option_page.appendChild(submit_button);
  submit_button.addEventListener("click", callback);
}

/// Called to validate user input.
function validate_input(field, value) {
  parsed_int = parseInt(value);
  if (isNaN(parsed_int)) {
    return false;
  }

  if (field == "yyyy" && parsed_int > 0) {
    return true;
  } else if (field == "mm" && parsed_int <= 12 && parsed_int > 0) {
    return true;
  } else if (field == "dd" && parsed_int <= 31 && parsed_int > 0) {
    return true;
  }

  return false;
}

/// submit_button callback function.
function submit_button_cb() {
  let yyyy = document.getElementById("yyyy").value;
  let mm = document.getElementById("mm").value;
  let dd = document.getElementById("dd").value;

  if (!validate_input("yyyy", yyyy)) {
    alert("`yyyy` is not leagal.");
    return;
  }

  if (!validate_input("mm", mm)) {
    alert("`mm` is not legal.");
    return;
  }

  if (!validate_input("dd", dd)) {
    alert("`dd` is not legal.");
    return;
  }

  let new_term_start_date = {
    yyyy: parseInt(yyyy),
    mm: parseInt(mm),
    dd: parseInt(dd),
  };

  chrome.storage.local.get("term_start_date", function(data) {
    let start_date = data.term_start_date;

    if (start_date.yyyy == new_term_start_date.yyyy &&
        start_date.mm == new_term_start_date.mm &&
        start_date.dd == new_term_start_date.dd) {
      alert("Nothing is changed ...");
    } else {
      chrome.storage.local.set({
        term_start_date: {
          yyyy: new_term_start_date.yyyy,
          mm: new_term_start_date.mm,
          dd: new_term_start_date.dd,
        },
      }, function() {
        alert("Date is successfully updated!")
      });
    }
  });
}

/// Called to construct page.
function construct_page() {
  chrome.storage.local.get("term_start_date", function(data) {
    let start_date = data.term_start_date;

    construct_input_field(option_page, "yyyy", start_date.yyyy);
    construct_input_field(option_page, "mm", start_date.mm);
    construct_input_field(option_page, "dd", start_date.dd);
  
    construct_submit_button(option_page, "submit_button", submit_button_cb);
  });
}


construct_page();