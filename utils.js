// # 读取本地数据
const getLocalData = localName => {
  let data = localStorage.getItem(localName);
  return data ? JSON.parse(data) : [];
}

// # 数据存到本地
const saveLocalData = (localItem, localData) => {
  localStorage.setItem(localItem, JSON.stringify(localData));
}

// 记录是不是第一次渲染本地数据
let isFirstEnter = false;
// # 渲染本地数据到页面上
const loadLocalData = (studentList) => {
  // let studentList = getLocalData("studentList");
  // 如果是第一次渲染，要将勾选框全部设为未选
  if (!isFirstEnter) {
    studentList.forEach(student => {
      student.checked = false;
    })
    saveLocalData("studentList", studentList);
  }
  const content = document.querySelector(".content-item-container");
  let id = studentList.map(student => student.dataId);
  // 先清空内容
  content.innerHTML = '';
  studentList.forEach((student, i) => {
    const newUl = document.createElement("ul");
    newUl.className = 'content-item';
    newUl.innerHTML = `<li class="choose-button">
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
  </ul>`
    content.appendChild(newUl);
  })
  isFirstEnter = true;
}

// # 验证学号和姓名是否重复，重复返回false
const hasStudent = (id, name) => {
  let studentList = getLocalData("studentList");
  return studentList.every(student => student.id !== id && student.name !== name);
}

// # 验证分数是否符合要求，不符合要求则返回不符合要求的科目的索引数组，符合则返回-1
const verifyScore = (...scores) => {
  let flag = true;
  let invalid = [];
  for (let i in scores) {
    flag = (~~scores[i] <= 100 && ~~scores[i] >= 0) ? true : false;
    if (!flag) {
      invalid.push(i);
    }
  }
  return invalid.length > 0 ? invalid : -1;
}

// # 处理不合法的分数输入
const handleInvalidScore = (scoreIndex, scoreInput) => {
  let invalidInput = [];
  for (let i in scoreIndex) {
    invalidInput.push(scoreInput[scoreIndex[i]]);
  }
  invalidInput.forEach(input => {
    input.value = '';
    input.classList.add('invalid-input');
    input.placeholder = '您输入的分数不合法';
    // 用户输入，则样式恢复
    input.oninput = function () {
      input.classList.remove('invalid-input');
      input.placeholder = '';
    }
  });
}
// # 处理不合法的姓名输入
// // 参数1为input框，参数2为提示语
const handleInvalidInput = function () {
  if (arguments.length > 2) {
    for (let i = 0; i < arguments.length - 1; i++) {
      arguments[i].value = '';
      arguments[i].classList.add('invalid-input');
      arguments[i].placeholder = "已存在此学生";
      arguments[i].oninput = function () {
        this.classList.remove('invalid-input');
        this.placeholder = '';
      }
    }
  } else {
    arguments[0].value = '';
    arguments[0].classList.add('invalid-input');
    arguments[0].placeholder = arguments[1];
    // 用户输入，则样式恢复
    arguments[0].oninput = function () {
      this.classList.remove('invalid-input');
      this.placeholder = '';
    }
  }
}

// # 验证id格式是否合法，11位纯数字
const verifyId = id => {
  const idReg = /^[0-9]{11}$/;
  return idReg.test(id) ? true : false;
}

// # 验证姓名格式是否合法，纯汉字
const verifyName = name => {
  const nameReg = /^[\u4E00-\u9FA5]+$/;
  return nameReg.test(name) ? true : false;
}

// # 计算平均分
const computeAvg = (...value) => {
  let average = 0;
  for (let item of value) {
    average += item;
  }
  average /= value.length;
  return average;
}

// # 成功toast
const handleSuccessToast = () => {
  const successToast = document.querySelector('.success-toast');
  mask.classList.add("show");
  successToast.classList.add("show-toast");
  setTimeout(() => {
    successToast.classList.remove("show-toast");
    mask.classList.remove("show");
  }, 500)
}

// # 学生平均分排名，平均分一样排名一样
const rankStudent = studentList => {
  // 按平均分降序排序
  studentList.sort((stuA, stuB) => {
    return stuB.average - stuA.average;
  })
  // 按平均分设置学生排名
  studentList.forEach((student, i) => {
    student['rank'] = i + 1;
  })

  let preAverage = 0; // 预定义分数
  let rank = 0;
  let same = 0;
  studentList.forEach(student => {
    if (student.average === preAverage) {
      student.rank = rank;
      same++;
    } else {
      rank += same;
      rank++;
      preAverage = student.average;
      same = 0; // 重新开始计数
      student.rank = rank;
    }
  })
}
// # 是否显示修改按钮
const isShowMod = () => {
  (getLocalData("studentList").filter(student => student.checked)).length === 1 ? modBtn.classList.add("show-toast") : modBtn.classList.remove("show-toast");
}
// # 删除按钮是否可用
const isShowDel = () => {
  delBtn.className.includes('okToDelete') ? delBtn.classList.remove("okToDelete") : delBtn.classList.add("okToDelete");
}
// # 修改学生成绩的操作
const modStudent = (studentList, target, index) => {
  // 分数的li数组
  let scoreLi = [...target.parentElement.parentElement.children].slice(3, 7);
  // 得到li中的span
  scoreLi = scoreLi.map(li => li.children[0]);
  for (let i = 0; i < scoreLi.length; i++) {
    let oldScore;
    // 点击分数
    scoreLi[i].onclick = function () {
      let _this = this; // 保存点击的分数的li
      oldScore = _this.innerText;
      // 修改按钮显示之后才能设为可编辑
      if (modBtn.className.includes("show-toast")) {
        // 将分数的li修改为可编辑
        this.setAttribute("contenteditable", true);
      }
      // 点击修改按钮
      modBtn.onclick = function () {
        _this.removeAttribute("contenteditable");
        // 修改后的内容
        let modText = scoreLi[i].innerText;
        // 需要被修改成绩的学生
        let modStudent = studentList[index];
        // 被修改的科目
        let modSubject = Array.from(Object.keys(studentList[index])).slice(2, 6)[i];
        if (isModValid(modText)) {
          // 修改成绩
          modStudent[modSubject] = modText;
          // 得到修改的学生的各项成绩
          let [mat, eng, alg, ope] = Array.from(Object.values(modStudent)).slice(2, 6);
          modStudent['average'] = computeAvg(+mat, +eng, +alg, +ope);
          // 修改完的学生重新加入数组
          studentList.splice(index, 1, modStudent);
          // 重新排名
          rankStudent(studentList);
          studentList.forEach(student => {
            student.checked = false;
          })
          saveLocalData("studentList", studentList);
          loadLocalData(studentList);
          // 显示成功提示
          handleSuccessToast();
          search.value = '';
          isShowMod();
        } else {
          alert("修改不合法！");
          scoreLi[i].innerText = oldScore;
        }
        delBtn.classList.remove("okToDelete");
      }
    }
    // 分数失去焦点
    scoreLi[i].onblur = function () {
      if(!isModValid(this.innerText)) {
        alert("修改不合法！");
        this.innerText = oldScore;
      }
    }
  }
}
// # 删除学生成绩的操作
const delStudent = (studentList) => {
  delBtn.onclick = function () {
    // 过滤掉checked为true的学生
    studentList = studentList.filter(student => !student.checked);
    // 重新排名
    rankStudent(studentList);
    saveLocalData("studentList", studentList);
    loadLocalData(studentList);
    // 显示成功提示
    handleSuccessToast();
    delBtn.classList.remove("okToDelete");
    // 清空输入框
    search.value = "";
    isShowMod();
  }
}
// # 分数修改是否合法
const isModValid = (modText) => {
  modText = +modText;
  return (modText < 100 && modText > 0) ? true : false;
}
