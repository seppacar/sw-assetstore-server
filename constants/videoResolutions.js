exports.VIDEO_RESOLUTIONS = {
  '4096x2304': {
    name: '4K',
    downscale: [
      { resolution: '1920x1080', name: 'FHD' },
      //   { resolution: '1280x720', name: 'HD' },
      { resolution: '640x360', name: 'SD' }
    ]
  },
  '4096x2160': {
    name: '4K',
    downscale: [
      { resolution: '1920x1080', name: 'FHD' },
      //   { resolution: '1280x720', name: 'HD' },
      { resolution: '640x360', name: 'SD' }
    ]
  },
  '3840x2160': {
    name: '4K',
    downscale: [
      { resolution: '1920x1080', name: 'FHD' },
      //   { resolution: '1280x720', name: 'HD' },
      { resolution: '640x360', name: 'SD' }
    ]
  },
  '1920x1080': {
    name: 'FHD',
    downscale: [
    //   { resolution: '1280x720', name: 'HD' },
      { resolution: '640x360', name: 'SD' }
    ]
  },
  '2304x4096': {
    name: '4K',
    downscale: [
      { resolution: '1080x1920', name: 'FHD' },
      //   { resolution: '720x1280', name: 'HD' },
      { resolution: '360x640', name: 'SD' }
    ]
  },
  '2160x4096': {
    name: '4K',
    downscale: [
      { resolution: '1080x1920', name: 'FHD' },
      //   { resolution: '720x1280', name: 'HD' },
      { resolution: '360x640', name: 'SD' }
    ]
  },
  '2160x3840': {
    name: '4K',
    downscale: [
      { resolution: '1080x1920', name: 'FHD' },
      //   { resolution: '720x1280', name: 'HD' },
      { resolution: '360x640', name: 'SD' }
    ]
  },
  '1080x1920': {
    name: 'FHD',
    downscale: [
    //   { resolution: '720x1280', name: 'HD' }
      { resolution: '360x640', name: 'SD' }
    ]
  }
//   '1080x1080': {
//     name: 'Square',
//     downscale: [
//       { resolution: '720x720', name: 'Square' },
//       { resolution: '360x360', name: 'Square' }
//     ]
//   },
//   '2160x2160': {
//     name: 'Square',
//     downscale: [
//       { resolution: '1080x1080', name: 'Square' },
//       { resolution: '720x720', name: 'Square' },
//       { resolution: '360x360', name: 'Square' }
//     ]
//   }
}
