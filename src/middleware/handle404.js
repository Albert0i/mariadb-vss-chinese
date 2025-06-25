
export function handle404(req, res, next) {
    res.status(404).render('404', {
      url: req.originalUrl,
      title: '找不到頁面',
      subTitle: '哎呀……這個頁面不存在',
      description: '輕輕的踏進迷霧，訪尋的頁面不見芳蹤。也許是緣慳一面，也許只是一場春夢。'
    });
  }  