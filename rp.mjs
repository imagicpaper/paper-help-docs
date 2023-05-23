import fs from 'fs'
import path from 'path'
import axios from 'axios'

const randomstr = () => {
   return Math.random().toFixed(32).slice(2, 10)
}

let reg = /<source\ src=\"(.*?)\">/g
async function handmd(filepath) {
    let buf = await fs.promises.readFile(filepath)
    let content = buf.toString('utf8')

    let m = content.matchAll(reg)

    for (let mat of m) {
        let url = mat[1]

        let resp = await axios.get(url, {
            responseType: 'arraybuffer'
        })

        let filename = 'video-'+ randomstr() + '.mp4'
        fs.writeFileSync('./public/' + filename, resp.data)
        content = content.replace(url, "/" + filename)
    }

    fs.writeFileSync(filepath, content)
}

async function walk(folder = './docs') {
    let files = await fs.promises.readdir(folder)

    files.forEach(name => {
        let fullpath = path.resolve(folder, name)
        let s = fs.statSync(fullpath)
        if (s.isFile()) {
            if (name.endsWith('.md')) {
                handmd(fullpath)
            }
        } else {
            walk(fullpath)
        }
    })
}

walk()