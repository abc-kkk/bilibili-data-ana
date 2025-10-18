// --- 轻量级JS MD5实现 (用于替代不支持的 crypto.subtle.digest('MD5')) ---
function md5 (string) {
  function rotateLeft (lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits))
  }

  function addUnsigned (lX, lY) {
    let lX4, lY4, lX8, lY8, lResult
    lX8 = (lX & 0x80000000)
    lY8 = (lY & 0x80000000)
    lX4 = (lX & 0x40000000)
    lY4 = (lY & 0x40000000)
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF)
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8)
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8)
      } else {
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8)
      }
    } else {
      return (lResult ^ lX8 ^ lY8)
    }
  }

  function F (x, y, z) { return (x & y) | ((~x) & z) }
  function G (x, y, z) { return (x & z) | (y & (~z)) }
  function H (x, y, z) { return (x ^ y ^ z) }
  function I (x, y, z) { return (y ^ (x | (~z))) }

  function FF (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function GG (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function HH (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function II (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function convertToWordArray (string) {
    let lWordCount
    let lMessageLength = string.length
    let lNumberOfWords_temp1 = lMessageLength + 8
    let lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64
    let lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16
    let lWordArray = Array(lNumberOfWords - 1)
    let lBytePosition = 0
    let lByteCount = 0
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4
      lBytePosition = (lByteCount % 4) * 8
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition))
      lByteCount++
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4
    lBytePosition = (lByteCount % 4) * 8
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition)
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29
    return lWordArray
  }

  function wordToHex (lValue) {
    let WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255
      WordToHexValue_temp = "0" + lByte.toString(16)
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2)
    }
    return WordToHexValue
  }

  function Utf8Encode (string) {
    string = string.replace(/\r\n/g, "\n")
    let utftext = ""
    for (let n = 0; n < string.length; n++) {
      let c = string.charCodeAt(n)
      if (c < 128) {
        utftext += String.fromCharCode(c)
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192)
        utftext += String.fromCharCode((c & 63) | 128)
      } else {
        utftext += String.fromCharCode((c >> 12) | 224)
        utftext += String.fromCharCode(((c >> 6) & 63) | 128)
        utftext += String.fromCharCode((c & 63) | 128)
      }
    }
    return utftext
  }

  let x = Array()
  let k, AA, BB, CC, DD, a, b, c, d
  let S11 = 7, S12 = 12, S13 = 17, S14 = 22
  let S21 = 5, S22 = 9, S23 = 14, S24 = 20
  let S31 = 4, S32 = 11, S33 = 16, S34 = 23
  let S41 = 6, S42 = 10, S43 = 15, S44 = 21
  string = Utf8Encode(string)
  x = convertToWordArray(string)
  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476
  for (k = 0; k < x.length; k += 16) {
    AA = a; BB = b; CC = c; DD = d
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478)
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756)
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB)
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE)
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF)
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A)
    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613)
    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501)
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8)
    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF)
    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1)
    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE)
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122)
    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193)
    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E)
    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821)
    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562)
    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340)
    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51)
    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA)
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D)
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453)
    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681)
    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8)
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6)
    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6)
    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87)
    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED)
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905)
    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8)
    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9)
    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A)
    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942)
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681)
    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122)
    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C)
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44)
    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9)
    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60)
    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70)
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6)
    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA)
    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085)
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05)
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039)
    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5)
    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8)
    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665)
    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244)
    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97)
    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7)
    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039)
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3)
    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92)
    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D)
    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1)
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F)
    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0)
    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314)
    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1)
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82)
    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235)
    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB)
    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391)
    a = addUnsigned(a, AA)
    b = addUnsigned(b, BB)
    c = addUnsigned(c, CC)
    d = addUnsigned(d, DD)
  }
  let temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)
  return temp.toLowerCase()
}


// --- WBI签名部分，从Python逻辑翻译而来 ---
const MIXIN_KEY_ENC_TABLE = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
  33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
  61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
  36, 20, 34, 44, 52
]

function getMixinKey (orig) {
  let tempStr = ''
  MIXIN_KEY_ENC_TABLE.forEach(i => {
    tempStr += orig[i]
  })
  return tempStr.slice(0, 32)
}

async function getWbiKeys () {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Referer': 'https://www.bilibili.com/'
  }
  try {
    const resp = await fetch('https://api.bilibili.com/x/web-interface/nav', { headers })
    const jsonContent = await resp.json()
    const imgUrl = jsonContent.data.wbi_img.img_url
    const subUrl = jsonContent.data.wbi_img.sub_url
    const imgKey = imgUrl.substring(imgUrl.lastIndexOf('/') + 1, imgUrl.lastIndexOf('.'))
    const subKey = subUrl.substring(subUrl.lastIndexOf('/') + 1, subUrl.lastIndexOf('.'))
    return { imgKey, subKey }
  } catch (e) {
    console.error("获取WBI密钥失败:", e)
    return null
  }
}

// 核心改动：不再是 async function，并使用我们自己的 md5 函数
function signParams (params, wbiKeys) {
  const mixinKey = getMixinKey(wbiKeys.imgKey + wbiKeys.subKey)
  const currTime = Math.round(Date.now() / 1000)
  params.wts = currTime

  const sortedParams = {}
  Object.keys(params).sort().forEach(key => {
    sortedParams[key] = params[key]
  })

  const query = new URLSearchParams(sortedParams).toString()
  const cleanQuery = query.replace(/[!'()*]/g, '')

  // 核心改动：使用上面提供的 md5() 函数
  const wbiSign = md5(cleanQuery + mixinKey)

  params.w_rid = wbiSign
  return params
}

// --- B站UP主视频爬取主函数 ---
async function fetchAllVideos (mid, sendResponse) {
  try {
    const wbiKeys = await getWbiKeys()
    if (!wbiKeys) {
      throw new Error('获取WBI密钥失败，无法继续。')
    }

    const cookie = await chrome.cookies.get({ url: "https://www.bilibili.com", name: "SESSDATA" })
    const sessdata = cookie ? cookie.value : ''

    let allVideos = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      let params = {
        mid: mid, ps: 30, tid: 0, pn: page, keyword: '',
        order: 'pubdate', platform: 'web', web_location: 1550101,
        order_avoided: 'true',
      }

      // 核心改动：移除了 await
      const signedParams = signParams(params, wbiKeys)
      const queryUrl = "https://api.bilibili.com/x/space/wbi/arc/search"
      const fullUrl = `${queryUrl}?${new URLSearchParams(signedParams).toString()}`

      const response = await fetch(fullUrl, {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Cookie': `SESSDATA=${sessdata}`,
          'Referer': `https://space.bilibili.com/${mid}/video`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        }
      })

      const data = await response.json()

      if (data.code === 0) {
        const videos = data.data?.list?.vlist || []
        if (videos.length > 0) {
          allVideos = allVideos.concat(videos)
          page++
          await new Promise(resolve => setTimeout(resolve, 1200))
        } else {
          hasMore = false
        }
      } else {
        throw new Error(`B站API返回错误: ${data.message || '未知错误'}`)
      }
    }
    sendResponse({ success: true, data: allVideos })

  } catch (error) {
    console.error('B站报告插件 - 后台获取数据失败:', error)
    sendResponse({ success: false, error: error.message })
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FETCH_VIDEOS') {
    fetchAllVideos(message.mid, sendResponse)
    return true
  }
});

