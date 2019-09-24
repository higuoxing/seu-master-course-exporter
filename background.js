/// If this extension is first time called, this method should
/// be executed to initialize storage.
function initialize_storage() {
  let init_term_start_date = {
    yyyy: 2019,
    mm: 09,
    dd: 09,
  };

  chrome.storage.sync.set({
    term_start_date: {
      yyyy: init_term_start_date.yyyy,
      mm: init_term_start_date.mm,
      dd: init_term_start_date.dd,
    },
  });
}

/// Executed when this extension is installed.
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.get("term_start_date", function(data) {
    if (data.term_start_date) {
      initialize_storage();
    }
  });
});