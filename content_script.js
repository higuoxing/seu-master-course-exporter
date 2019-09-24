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
///   course_period: ZCBH (我也不知道怎么翻译) 01111100000000000 表示 2-6 周上课
///   week: XQ (星期几)
/// }
function read_course_info(course) {
  let course_info = {
    course_name: course.KCMC,
    class_name: course.BJMC,
    position: course.JASMC,
    begin_time: course.KSSJ,
    end_time: course.JSSJ,
    prof_name: course.JSXM,
    course_period: course.ZCBH,
    week: course.XQ,
  };

  return course_info;
}

/// Add course to schedule.
function add_course_to_schedule(schedule, course_info) {
  console.log(course_info);
}

/// Dump courses to `.ics` file.
function dump_to_ics_file(courses) {
  if (courses.length <= 0) {
    alert("貌似没有课程哦~");
    return;
  }

  let schedule = ics();
  // schedule.addEvent('Demo Event', 'This is thirty minute event', 'Nome, AK', '2019-09-24T18:00', '2019-09-24T21:00');
  for (let course of courses) {
    let info = read_course_info(course);
    add_course_to_schedule(schedule, info);
  }

  // schedule.download();
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