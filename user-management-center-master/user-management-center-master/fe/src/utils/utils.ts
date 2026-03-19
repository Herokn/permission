/**
 * @description: 自动下载
 * @param {string} url
 * @param {string} name
 */
export const autoDownload = (url: string, name = '') => {
  console.log(url);
  const elink = document.createElement('a');
  elink.href = url;
  if (name) {
    // 当提供文件名时，使用 download 属性以触发保存（适用于图片/ico等可预览类型）
    elink.download = name;
  } else {
    // 未提供名称时，保持原行为在新标签打开（由服务器决定是否下载）
    elink.target = '_blank';
  }
  document.body.appendChild(elink);
  elink.click();
  URL.revokeObjectURL(elink.href);
  document.body.removeChild(elink);
};

/**
 * @description: json转search
 * @param { object } json
 * @retrun { string } a=1&b=2
 */

export const json2search = (json: Record<string, string | number>) => {
  let str = '';
  Object.keys(json).forEach((key) => {
    json[key] && (str += `${key}=${json[key]}&`);
  });
  return str.slice(0, -1);
};

/**
 * @description: base64 转换为 Blob
 * @retrun { string }
 */
export const base64ToBlob = (base64: string, type = 'image/png') => {
  const binary = atob(base64.split(',')[1]);
  const array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type });
};

/**
 * @description: 获取环境变量API_URL
 * @param { string } path 路径
 * @retrun { string }
 */
export const getENVAPIURLByPath = (path: string) => `${import.meta.env.VITE_API_URL_PREFIX}${path}`;

export const getTrackerENVAPIURLByPath = (path: string) => `${import.meta.env.VITE_LOGIN_API_URL_PROJECT}${path}`;

/**
 * @description: 获取下载环境变量API_URL
 * @param { string } path 路径
 * @retrun { string }
 */
export const getDownloadENVURLByPath = (path: string) =>
  `${import.meta.env.MODE !== 'development' ? '' : import.meta.env.VITE_API_URL}${
    import.meta.env.MODE !== 'development' ? import.meta.env.VITE_API_URL_PREFIX : ''
  }${path}`;

export const getTrackerDownloadENVURLByPath = (path: string) =>
  `${import.meta.env.MODE !== 'development' ? '' : import.meta.env.VITE_TRACKER_API_URL}${
    import.meta.env.MODE !== 'development' ? import.meta.env.VITE_LOGIN_API_URL_PROJECT : ''
  }${path}`;

/**
 * @description: 获取环境 domainURL
 * @param { string } path 路径
 * @retrun { string }
 */
export const getENVDomainURLByPath = (path: string) =>
  `${import.meta.env.MODE !== 'development' ? window.location.origin : import.meta.env.VITE_TEST_URL}${path}`;

/**
 * @description: 获取图片大小
 * @param { string } imageUrl 路径
 * @retrun { string }
 */
export const getImageSizeByUrl = async (imageUrl: string) => {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    const contentLength = response.headers.get('Content-Length');

    if (contentLength) {
      const sizeInBytes = parseInt(contentLength, 10);
      const sizeInKB = (sizeInBytes / 1024).toFixed(2);
      const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

      return {
        bytes: sizeInBytes,
        kb: sizeInKB,
        mb: sizeInMB,
      };
    }
  } catch (error) {
    console.error('获取图片大小失败:', error);
  }
  return null;
};

/**
 * @description: 条件返回
 * @param { unknown } condition 条件
 * @param { unknown } trueValue 为true时返回
 * @param { unknown } falseValue 为false时返回
 * @retrun { unknown }
 */
export const ifReturn = (condition: unknown, trueValue: unknown, falseValue: unknown) => {
  return condition ? trueValue : falseValue;
};

/**
 * @description: 找到标识符 后面的第一个字母 替换成大写
 * @param { string } str 字符串
 * @param { string } identifier 标识符
 * @retrun { string }
 */
// 找到标识符 后面的第一个字母 替换成大写
// identifier 如果是空字符串 则 整个字符 首字母大写
// identifier 如果是 '-' 则 找到中划线后面的第一个字母 替换成大写
export const replaceFirstLetter = (str: string, identifier = '-') => {
  if (!str) {
    return str;
  }
  const wordStr = str.split(identifier)[identifier ? 1 : 0];
  if (!wordStr) {
    return str;
  }
  return str.replace(`${identifier}${wordStr[0]}`, wordStr[0].toUpperCase());
};
