/// TODO: Read chrome storage.
/// TODO: Update chrome storage.

let SCHEDULE_URL = "http://yjsxk.urp.seu.edu.cn/yjsxkapp/sys/xsxkapp/xsxkCourse/loadKbxx.do"

/// Read course information.
/// struct {
///   course_name: KCMC (课程名称)
///   class_name: BJMC (班级名称)
///   position: JASMC (上课地点)
///   begin_time: KSSJ (上课时间)
///   end_time: JSSJ (下课时间)
///   prof_name: JSXM (教授姓名)
///   course_period: ZCBH (我也不知道这是什么鬼拼音) 01111100000000000 表示 2-6 周上课
///   week: XQ (星期几)
/// }
function read_course_info(course) {
  function pad(num, size){ return ("000000000" + num).substr(-size); }
  
  let start_time = pad(course.KSSJ, 4);
  let end_time = pad(course.JSSJ, 4);

  let course_info = {
    course_name: course.KCMC,
    class_name: course.BJMC,
    position: course.JASMC,
    begin_time_hours: parseInt(start_time.substr(0, 2)),
    begin_time_minutes: parseInt(start_time.substr(2, 2)),
    end_time_hours: parseInt(end_time.substr(0, 2)),
    end_time_minutes: parseInt(end_time.substr(2, 2)),
    prof_name: course.JSXM,
    course_period: course.ZCBH,
    week: course.XQ,
  };

  return course_info;
}

/// Add days to calculate next date.
function add_days(date, days) {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/// Add hours to calculate next time.
function add_hours(date, hours) {
  let result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/// Add minutes to calculate next time.
function add_minutes(date, minutes) {
  let result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/// Add course to schedule.
function add_course_to_schedule(schedule, date, course_info) {
  let base_date = add_days(date, course_info.week - 1);

  let begin_time_hours = add_hours(base_date, course_info.begin_time_hours);
  let begin_time_minutes = add_minutes(begin_time_hours, course_info.begin_time_minutes);

  let end_time_hours = add_hours(base_date, course_info.end_time_hours);
  let end_time_minutes = add_minutes(end_time_hours, course_info.end_time_minutes);
  
  // iterate over weeks.
  for (let week = 0; week < course_info.course_period.length; week ++) {
    let begin_time = add_days(begin_time_minutes, week * 7);
    let end_time = add_days(end_time_minutes, week * 7);

    if (course_info.course_period[week] == "1") {
      schedule.addEvent(
        /* Subject */ course_info.prof_name + "@" + course_info.course_name,
        /* Description */"周次: " + week.toString() + "\n" +
                         "课程: " + course_info.course_name + "\n" +
                         "地点: " + course_info.position + "\n" +
                         "教师: " + course_info.prof_name + "\n" +
                         "班级: " + course_info.class_name + "\n",
        /* Position */course_info.position,
        /* Start time */begin_time.toISOString(),
        /* End time */end_time.toISOString());
    }
  }
}

/// Dump courses to `.ics` file.
function dump_to_ics_file(courses) {
  if (courses.length <= 0) {
    alert("貌似没有课程哦~");
    return;
  }

  let schedule = ics();

  chrome.storage.local.get("term_start_date", function (data) {
    let term_start_date = data.term_start_date;
    function pad(num, size){ return ("000000000" + num).substr(-size); }

    for (let course of courses) {
      let info = read_course_info(course);
      add_course_to_schedule(schedule, new Date(
        pad(term_start_date.yyyy, 4) + "-" + 
        pad(term_start_date.mm, 2) + "-" + 
        pad(term_start_date.dd, 2) + "T00:00"), info);
    }
    
    schedule.download();
  });
}

/// Callback functions for click event of injected <a> tag.
function injected_a_tag_callback() {
  fetch(SCHEDULE_URL)
    .then(function (r) { return r.text() })
    .catch(function (e) {
      alert("网络错误");
    })
    .then(function (result) {
      let courses = JSON.parse(result);
      dump_to_ics_file(courses.results);
    })
    .catch(function (e) {
      alert("认证失败，请重新登录")
    });
}

/// Add event listener to tell if user has logged in.
document.addEventListener("DOMSubtreeModified", function(event){
    let student_info = document.getElementById("stundentinfoDiv");
    if (student_info != null) {
      let myplan = student_info.getElementsByClassName("cv-user-my-plan");
      if (myplan.length == 2) {
        // User has logged in and we have not inserted <div class="cv-user-my-plan">
        injected_cv_user_my_plan = document.createElement("div");
        injected_cv_user_my_plan.className = "cv-user-my-plan";
        injected_cv_user_my_plan.style = "text-align:center;";

        // Construct a tag.
        let injected_a_tag = document.createElement("a");
        injected_a_tag.style = "margin-left:12px;font-size:14px;text-decoration:underline;";
        injected_a_tag.innerHTML = "下载 `.ics` 日历文件";
        injected_a_tag.href = "#";
        injected_a_tag.addEventListener("click", injected_a_tag_callback);

        // Append childs
        injected_cv_user_my_plan.appendChild(injected_a_tag);
        student_info.appendChild(injected_cv_user_my_plan);
      }
    }
});
