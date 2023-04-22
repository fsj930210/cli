'use strict';
import Command from '@fengshaojian/command';
import { 
  Github,
  Gitee,
  getGitPlatform, 
  log, 
  makeList, 
  makeInput
} from '@fengshaojian/utils';

const PRE_PAGE = '${pre_page}';
const NEXT_PAGE = '${next_page}';
const SEARCH_REPO = 'search_repo';
const SEARCH_CODE = 'search_code';

class InstallCommand extends Command {
	get command() {
		return 'install';
	}
	get description() {
		return 'install a project';
	}
	get options() {
		return [
			
		];
	}
	async action([name, opts]) {
		log.verbose('install....');
    await this.genGitAPI();
    await this.searchGitAPI();
	}
  async genGitAPI() {
    let platform;
    if (getGitPlatform()) {
      platform = getGitPlatform()
    } else {
      platform = await makeList({
        message: '请选择git平台',
        choices: [
          {
            name: 'Github',
            value: 'github'
          },
          {
            name: 'Gitee',
            value: 'gitee'
          }
        ]
      })

    }
    let gitAPI
    if (platform === 'github') {
      gitAPI = new Github();
    } else {
      gitAPI = new Gitee();
    }
    this.platform = platform;
    gitAPI.savePlatform(platform);
    await gitAPI.init();
    this.gitAPI = gitAPI;
  }
  async searchGitAPI () {
    this.page = 1;
    this.per_page = 10;
    this.tags_page = 1;
    this.tags_perPage = 10;
    this.tags_list = [];
    // 1.选择搜索模式
    if (this.platform === 'github') {
      this.mode = await makeList({
        message: '请选择搜索模式',
        choices: [{
            name: '仓库',
            value: SEARCH_REPO
          },
          {
            name: '源码',
            value: SEARCH_CODE
          }]
      });
    } else {
      this.mode = SEARCH_REPO;
    }
    // 2.  搜索关键词和语言
    this.q = await makeInput({
      message: '请输入想要查询的关键词',
      validate: (v) => {
        if (v.length <= 0) {
          return '请输入想要查询的关键词'
        }
        return true;
      }
    });
    this.language = await makeInput({
      message: '请输入开发语言'
    });
    log.verbose('查询的关键词和开发语言', this.q, this.language)
    await this.doSearch();
  }
  // ========== Project ===========
  async doSearch() {
    this.list = [];
    this.totalCount = 0;
    let searchRes;
    if (this.platform === 'github') {
      //2. 组合搜索参数
      let params = {
        q: this.q + `+language:${this.language}`,
        sort: 'stars',
        order: 'desc',
        per_page: this.per_page,
        page: this.page
      }
      if (this.mode === SEARCH_REPO) {
        searchRes = await this.gitAPI.searchRepositories(params);
        this.list = searchRes.items.map(item =>({
          name: `${item.full_name}(${item.description})`,
          value: `${item.full_name}`
        }));
      } else {
        searchRes = await this.gitAPI.searchCode(params);
        this.list = searchRes.items.map(item =>({
          name: `${item.repository.full_name}${item.repository.description ? `(${item.repository.description})` : ''}`,
          value: `${item.repository.full_name}`
        }));
        
      }
      this.totalCount = searchRes.total_count;
      await this.doChooseProject();
    } else {
       //2. 组合搜索参数
       let params = {
        q: this.q,
        sort: 'stars_count',
        order: 'desc',
        per_page: this.per_page,
        page: this.page
      }
      if (this.language) {
        params.language = this.language; // 注意这里需要严格符合gitee规范，最好写成一个list，让他选
      }
      searchRes = await this.gitAPI.searchRepositories(params);
      this.list = searchRes.map(item =>({
        name: `${item.full_name}${item.description ? `(${item.description})` : ''}`,
        value: `${item.full_name}`
      }));
      this.totalCount = 99999;
      await this.doChooseProject();
    }
  }
  async nextPage() {
    this.page++;
    await this.doSearch();
  }
  async prePage() {
    this.page--;
    await this.doSearch();
  }
  async doChooseProject() {
    if (this.totalCount > 0) {
      // 翻页 是否具有翻页条件
      if (this.page * this.per_page < this.totalCount || this.list.length > 0) {
        this.list.push({
          value: NEXT_PAGE,
          name: '下一页'
        })
      } 
      if (this.page > 1 ) {
        this.list.unshift({
          value: PRE_PAGE,
          name: '上一页'
        })
      }
      const keyword = await makeList({
        message: `请选择需要下载的项目${this.platform === 'github' ? `(共${this.totalCount}条数据)` : ''}`,
        choices: this.list
      });
      log.verbose('选择的是', keyword);
      this.keyword = keyword;
      if (this.keyword === NEXT_PAGE) {
        this.nextPage()
      } else if (this.keyword === PRE_PAGE) {
        this.prePage()
      } else {
        // 选择下载的Tag
        this.doSearchTags()
      }
    }
  }
  // ======= Tags ===========
  async doSearchTags() {
    this.tags_list = [];
    let params = {
      per_page: this.tags_perPage,
      page: this.tags_page
    }
    const searchRes = await this.gitAPI.searchTags(this.keyword, params);
    console.log(searchRes)
    this.tags_list = searchRes.map(item => ({
      name: item.name,
      value: item.name
    }));
    console.log(this.tags_list)
    if (this.tags_list.length < 0 && this.tags_page <= 1) {
      log.info('没有tag将下载主分支代码');
    } else {
      await this.doChooseTag();
    }
  }
  async nextTagsPage() {
    this.tags_page++;
    await this.doSearchTags();
  }
  async preTagsPage() {
    this.tags_perPage--;
    await this.doSearchTags();
  }
  async doChooseTag () {
      // 翻页 是否具有翻页条件
      if (this.tags_list.length > 0 && this.platform === 'github') {
        this.tags_list.push({
          value: NEXT_PAGE,
          name: '下一页'
        })
      } 
      if (this.tags_page > 1 ) {
        this.tags_list.unshift({
          value: PRE_PAGE,
          name: '上一页'
        })
      }
      const keyword = await makeList({
        message: `请选择需要下载的Tag`,
        choices: this.tags_list
      });
      log.verbose('选择的Tag是', keyword);
      if (keyword === NEXT_PAGE) {
        this.nextTagsPage()
      } else if (keyword === PRE_PAGE) {
        this.preTagsPage()
      } else {
        // 下载项目
        this.download()
      }
    
  }
  // =========== 下载模板 ==========
  download() {

  }
	preAction() {
		// log.info('pre');
	}
	postAction() {
		// log.info('post');
	}
}
function createInstallCommand(program) {
	return new InstallCommand(program);
}

export default createInstallCommand;
