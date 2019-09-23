let change_color = document.getElementById("change-color");
change_color.onclick = function(element) {
  let color = element.target.value;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {
        code: 'document.body.style.backgroundColor = "' + color + '";'});
      });
};
