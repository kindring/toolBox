const fs = require("fs");
const path = require("path");

// 一个函数，读取指定目录, 返回一个数组
function readDir(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
        if (err) {
            reject(err);
        } else {
            resolve(files);
        }
        });
    });
}

// 一个函数,只获取文件名中不包含后缀的文件名
function getFileNameNoExt(fileName) {
    return fileName.substring(0, fileName.lastIndexOf("."));
}

/**
 * 一个函数,用于将label文件夹中的文件与image文件夹中的文件进行比较,如果相同,则将image文件夹中的文件复制到targetImage文件夹中
 * @param labelPath  label文件夹路径
 * @param imagePath image文件夹路径
 * @param targetImagePath targetImage文件夹路径
 */
function main(labelPath,imagePath,targetImagePath){
    // 如果targetImage文件夹不存在,则创建
    if (!fs.existsSync(targetImagePath)) {
        fs.mkdirSync(targetImagePath);
    }
    // 读取label文件夹,获取文件名列表,并去掉后缀,得到文件名列表,将image文件夹中的文件名与label文件夹中的jpg图片进行比较,如果相同,则将image文件夹中的文件复制到targetImage文件夹中
    readDir(labelPath).then((files) => {
        console.log(files)
        files.forEach((file) => {
            let fileName = getFileNameNoExt(file);
            let imageFile = path.join(imagePath, fileName + ".jpg");
            let targetImageFile = path.join(targetImagePath, fileName + ".jpg");
            // 进度提示
            console.log("正在复制文件: " + imageFile);
            // 如果image文件夹中的文件存在,则复制到targetImage文件夹中,不存在则跳过该文件,并且提示文件不存在
            if (fs.existsSync(imageFile)) {
                fs.copyFile(imageFile, targetImageFile, (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("复制成功");
                    }
                });
            }else {
                console.log("文件不存在");
            }

        });
    });
}


function delNotImageLabel(labelPath,imagePath){
    // 删除没有对应image的label
    readDir(labelPath).then((files) => {
        // 去除后缀
        files.forEach((file) => {
          // 获取文件名
            let fileName = getFileNameNoExt(file);
            let imageFile = path.join(imagePath, fileName + ".jpg");
            // 如果图片不存在则删除该label
            if (!fs.existsSync(imageFile)) {
                let labelFile = path.join(labelPath, file);
                fs.unlink(labelFile, (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("删除成功");
                    }
                });
            }
        })
    })
}

// 一个将文件的换行符号转换为windows系统和unix同时兼容的换行符号的函数
function convertLineBreaks(str) {
    return str.replace(/(\r\n|\n|\r)/gm, "\r\n");
}

// delNotImageLabel(labelPath,targetImagePath);
// main(labelPath,imagePath,targetImagePath);
// Dirs.forEach((dir)=>{
//     let labelPath = path.join(basePath,dir,"labels");
//     let imagePath = path.join(basePath,dir,"images");
//     let targetImagePath = path.join(basePath,dir,"targetImage");
//     main(labelPath,imagePath,targetImagePath);
// })

// 批量修改文件名,去除其中的空格,将带括号的部分修改为下划线
function changeFileName(dir) {
    readDir(dir).then((files) => {
        files.forEach((file) => {
            let fileName = file.replace(/\s/g, "");
            let newFileName = fileName.replace(/\(/g, "_").replace(/\)/g, "");
            let oldPath = path.join(dir, file);
            let newPath = path.join(dir, newFileName);
            fs.rename(oldPath, newPath, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("修改成功");
                }
            });
        });
    });
}

// 将文件夹中的图片转移到另一个文件夹中,并且将文件名修改为从1开始的数字 使用async await 配合 [err,res] = await handle(readDir(dir))的方式,禁止使用callback 提前结束函数
async function moveImage(dir, targetDir) {
    let [err, files] = await handle(readDir(dir));
    if (err) {
        console.log(err);
        return;
    }
    files.forEach(async (file, index) => {
        let oldPath = path.join(dir, file);
        let newPath = path.join(targetDir, index + ".jpg");
        let [err] = await handle(fs.rename(oldPath, newPath));
        if (err) {
            console.log(err);
            return;
        }
    });
}

// 一个带取消功能的延迟函数可以在外部调用cancel方法来 取消执行
function delay(time) {
    let timer = null;
    let promise = new Promise((resolve, reject) => {
        timer = setTimeout(() => {
            resolve();
        }, time);
    });
    promise.cancel = (msg) => {
        clearTimeout(timer);
        reject(msg);
    };
    return promise;
}


function changeImageName(dir) {
    readDir(dir).then((files) => {
        files.forEach((file, index) => {
            let oldPath = path.join(dir, file);
            let newPath = path.join(dir, index + ".jpg");
            fs.rename(oldPath, newPath, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("修改成功");
                }
            });
        });
    });
}

/**
 * 读取文件
 * @param filePath
 * @returns {Promise<unknown>}
 */
function fsReadFile(filePath){
    return new Promise((resolve,reject)=>{
        fs.readFile(filePath,(err,data)=>{
            if(err){
                reject(err);
            }else{
                resolve(data);
            }
        })
    })
}

/**
 * 写入文件 会覆盖原有文件
 * @param filePath 文件路径
 * @param data 写入的数据
 * @returns {Promise<unknown>}
 */
function fsWriteFile(filePath,data){
    return new Promise((resolve,reject)=>{
        fs.writeFile(filePath,data,(err)=>{
            if(err){
                reject(err);
            }else{
                resolve();
            }
        })
    })
}

/**
 * 用于处理异步函数的错误
 * @param promise {Promise} 异步函数
 * @returns {Promise<Array>} [err, val]
 */
function handle (promise){
    return new Promise(resolve => {
        try{
            promise.then(val => {
                resolve([null, val])
            }).catch(err => {
                resolve([err,null])
            })
        }catch(err){
            resolve([err,null])
        }
    })
}

/**
 * 批量读取目录下的文件,将换行符号转换为\r\n
 * @param dir {string} 目录
 * @returns {Promise<number>} 0
 */
async function changeLineBreaks(dir) {
    let err,res,fileData;
    [err,res] = await handle(readDir(dir));
    if(err){
        console.log(err);
        console.log(`读取${dir}目录失败`);
        return 0;
    }
    console.log(res);
    let files = res;
    for (let i = 0; i < files.length; i++) {
        // res[i] = path.join(dir,res[i]);
        let file = files[i];
        console.log(file);
        [err,res] = await handle(fsReadFile(path.join(dir,file)));
        if (err) {
            console.log(err);
            console.log(`读取${file}文件失败`);
            return 0;
        }
        let str = convertLineBreaks(res.toString());
        [err,res] = await handle(fsWriteFile(path.join(dir,file),str));
        if (err) {
            console.log(err);
            console.log(`写入${file}文件失败`);
            return 0;
        }
    }
}



let labelPath = "E:\\epower_v2\\shigonqixie_test\\labels";
let imagePath = "E:\\epower_v2\\shigonqixie_test\\images";
let targetImagePath = "E:\\epower_v2\\shigonqixie_test\\targetImage";

let basePath = "E:\\epower_v2\\save";
let Dirs = [
    "diaoche",
    "diaoxianyiwu",
    "kache",
    "tadiao",
]

// main(labelPath,imagePath,targetImagePath);
// test data

changeLineBreaks(labelPath).then(r => {
    console.log(r);
});


// changeFileName("E:\\epower_v2\\shigonqixie\\images");

