class Student {
  // id学号，name姓名
  // mat高数成绩，eng英语成绩，alg算法成绩，ope操作系统成绩
  // average平均分，checked是否被选中
  constructor(id, name, mat, eng, alg, ope, average, checked, dataId) {
    this.id = id;
    this.name = name;
    this.mat = mat;
    this.eng = eng;
    this.alg = alg;
    this.ope = ope;
    this.average = average;
    this.checked = checked;
    this.dataId = dataId;
  }
}
const chooseBtn = document.querySelectorAll('.choose-button'); // 选中学生按钮
const addBtn = document.querySelector('.add-student'); // 添加学生按钮
const delBtn = document.querySelector('.del-student'); // 删除学生按钮
const mask = document.querySelector('.mask');
const addBox = document.querySelector('.add-box');
const saveBtn = document.querySelector('#save-input'); // 保存按钮
const exitBtn = document.querySelector('#exit-input'); // 退出按钮
const allInput = Array.from(document.querySelectorAll('.add-wrapper input')); // 所有输入框
const scoreInput = Array.from(document.querySelectorAll('.add-wrapper input')).slice(2, 6); // 分数输入框
const nameInput = document.querySelector('#input-name'); // 姓名输入框
const idInput = document.querySelector('#input-id'); // id输入框
const modBtn = document.querySelector(".mod-student");
const search = document.querySelector("#search-input"); // 搜索框
const studentContainer = document.querySelector(".content-item-container"); // 委托父元素
const searchContainer = document.querySelector(".search-item-container");
// 点击添加学生，跳出添加框
addBtn.onclick = function () {
  mask.classList.add("show");
  addBox.classList.add("show");
}

// 先渲染本地数据到页面上
loadLocalData(getLocalData("studentList"));

// 用来找到每个学生
let dataId;

// 点击保存按钮
saveBtn.onclick = function () {
  let name = document.querySelector('#input-name').value;
  let id = document.querySelector('#input-id').value;
  let mat = document.querySelector('#input-math').value;
  let eng = document.querySelector('#input-english').value;
  let alg = document.querySelector('#input-algorithm').value;
  let ope = document.querySelector('#input-operation').value;
  if (!name || !id || !mat || !eng || !alg || !ope) {
    alert("禁止为空");
    return;
  } else {
    // 输入的姓名是否合法
    if (!verifyName(name)) {
      handleInvalidInput(nameInput, "您输入的姓名不合法");
      return;
    }
    // 输入的学号是否合法
    if (!verifyId(id)) {
      handleInvalidInput(idInput, "您输入的学号不合法");
      return;
    }
    // 输入的学生是否已存在
    if (!hasStudent(id, name)) {
      handleInvalidInput(idInput, nameInput, "已存在此学生");
      return;
    }
    // 输入的分数是否合法
    if (verifyScore(mat, eng, alg, ope) != -1) {
      handleInvalidScore(verifyScore(mat, eng, alg, ope), scoreInput);
      return;
    }


    // 计算平均分
    let average = computeAvg(+mat, +eng, +alg, +ope);
    // 读取本地的学生数组
    let studentList = getLocalData("studentList");

    // 初值为0，之后每次取本地中最大的dataId+1赋值给下一个新学生
    if (!studentList.length) {
      dataId = 0;
    } else {
      let arr = studentList.sort((a, b) => b.dataId - a.dataId)[0];
      dataId = arr.dataId + 1;
    }

    // 新建一个学生
    const {
      ...newStudent
    } = new Student(id, name, mat, eng, alg, ope, average, false, dataId++);
    // [学生1，学生2，学生3]
    // Student类，name，id，math，..
    // new Student ,学生对象 {id,}

    // 本地学生列表为空
    if (!studentList.length) {
      newStudent['rank'] = 1; // 学生排名为1
      studentList.push(newStudent);
    } else {
      studentList.push(newStudent);
      // 排名
      rankStudent(studentList);
    }
    // 修改后的学生数组存进本地
    saveLocalData("studentList", studentList);
    // 学生数组渲染在页面上
    loadLocalData(studentList);
    // 清空所有input框
    allInput.forEach(input => input.value = '');
    addBox.classList.remove("show");
    // 显示成功提示
    handleSuccessToast();
  }
}

// 关闭添加窗口
exitBtn.onclick = function () {
  allInput.forEach(input => input.value = '');
  addBox.classList.remove("show");
  mask.classList.remove("show");
}

// 搜索框输入
search.oninput = function () {
  const input = this.value;
  if (input.trim("") === '') {
    return;
  }
  let studentList = getLocalData("studentList");
  // 根据搜索词过滤学生列表
  studentList = studentList.filter(student => student.id.indexOf(input) !== -1);
  // 过滤后的学生列表的dataId
  let id = studentList.map(student => student.dataId);
  let str = "";
  studentList.forEach((student, i) => {
    str += `<ul class="content-item">
          <li class="choose-button">
            <img src="${student.checked ? './img/选中.png' : './img/未选中.png'}" alt="" data-id=${id[i]}>
          </li>
          <li><span>${student.id}</span></li>
          <li><span>${student.name}</span></li>
          <li><span>${student.mat}</span></li>
          <li><span>${student.eng}</span></li>
          <li><span>${student.alg}</span></li>
          <li><span>${student.ope}</span></li>
          <li><span>${student.average}</span></li>
          <li><span>${student.rank}</span></li>
        </ul>`;
  })
  studentContainer.innerHTML = str;
}

// 点击了勾选框
studentContainer.onclick = function (e) {
  // 点击的check按钮
  let target = e.target;
  let id = target.dataset.id; // 点击的勾选框的索引

  let studentList = getLocalData("studentList");
  // 找到本地存储的学生列表中对应的该学生
  let index = studentList.findIndex(student => student.dataId === +id);
  // 改变本地中的checked值
  studentList[index].checked = !studentList[index].checked;
  saveLocalData("studentList", studentList);
  // 改变勾选框图片
  target.src = studentList[index].checked ? './img/选中.png' : './img/未选中.png';
  // 获取到点击的该条ul
  const studentItem = target.parentElement.parentElement;
  // 学生条目高亮
  studentList[index].checked ? studentItem.classList.add("student-checked") : studentItem.classList.remove("student-checked");
  isShowMod();
  // 删除功能：至少有一个勾选框被选中时才触发
  if (studentList.some(student => student.checked)) {
    // 删除按钮高亮
    delBtn.classList.add("okToDelete");
    delStudent(studentList);
  } else {
    isShowDel();
  }
  // 修改功能
  modStudent(studentList,target, index);
}

