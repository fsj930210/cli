'use strict';
import Command from '@fengshaojian/command';
import ora from 'ora'
import { 
  Github,
  Gitee,
  getGitPlatform, 
  log, 
  makeList, 
  makeInput,
  printErrorLog
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
    await this.doSearch();
    await this.download();
    await this.installDependencies();
    await this.bootstarpProject();
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
    
  }
  // ========== Project ===========
  async doSearch() {
    this.list = [];
    this.totalCount = 0;
    let searchRes;
    const spinner = ora(`正在搜索${this.q} ${this.language}`).start();
    try {
      if (this.platform === 'github') {
        //2. 组合搜索参数
        let params = {
          q: this.q + `+language:${this.language}`,
          // sort: 'stars',
          order: 'desc',
          per_page: this.per_page,
          page: this.page
        }
        if (this.mode === SEARCH_REPO) {
          searchRes = await this.gitAPI.searchRepositories(params);
          spinner.stop();
          this.list = searchRes.items.map(item =>({
            name: `${item.full_name}(${item.description})`,
            value: `${item.full_name}`
          }));
        } else {
          searchRes = await this.gitAPI.searchCode(params);
          spinner.stop();
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
          // sort: 'stars_count',
          order: 'desc',
          per_page: this.per_page,
          page: this.page
        }
        if (this.language) {
          params.language = this.language; // 注意这里需要严格符合gitee规范，最好写成一个list，让他选
        }
        searchRes = await this.gitAPI.searchRepositories(params);
        spinner.stop();
        this.list = searchRes.map(item =>({
          name: `${item.full_name}${item.description ? `(${item.description})` : ''}`,
          value: `${item.full_name}`
        }));
        this.totalCount = 99999;
        await this.doChooseProject();
      }
    } catch (error) {
      spinner.stop();
      printErrorLog(error);
      
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
     
      if (keyword === NEXT_PAGE) {
        await this.nextPage()
      } else if (keyword === PRE_PAGE) {
        await this.prePage()
      } else {
        this.keyword = keyword;
        // 选择下载的Tag
       await this.doSearchTags()
      }
    }
  }
  // ======= Tags ===========
  async doSearchTags() {
    const spinner = ora(`正在查询${this.keyword}的Tags`).start();
    try {
      this.tags_list = [];
      let params = {
        per_page: this.tags_perPage,
        page: this.tags_page
      }
      const searchRes = await this.gitAPI.searchTags(this.keyword, params);
      spinner.stop();
      this.tags_list = searchRes.map(item => ({
        name: item.name,
        value: item.name
      }));
      console.log('this.tags_list', this.tags_list)
      if (this.tags_list.length <= 0 && this.tags_page <= 1) {
        this.tag = '';
      } else {
        await this.doChooseTag();
      }
    } catch (error) {
      spinner.stop();
      printErrorLog(error);
      
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
        await this.nextTagsPage()
      } else if (keyword === PRE_PAGE) {
        await this.preTagsPage()
      } else {
        this.tag = keyword;
      }
    
  }
  // =========== 下载模板 ==========
  async download() {
    const spinner = ora(`正在下载${this.keyword}`).start();
    try {
      await this.gitAPI.cloneGitRepo(this.keyword, this.tag);
      spinner.stop()
      log.success('下载成功')
    } catch (error) {
      spinner.stop();
      printErrorLog(error);
    }
  }

  // ========== 安装依赖 ===========
  async installDependencies () {
    const spinner = ora(`正在安装依赖：${this.keyword}(${this.tag})`).start()
    try {
     const res =  await this.gitAPI.installDependencies(process.cwd(), this.keyword);
      spinner.stop();
      if (!res) {
        log.success(`依赖安装失败：${this.keyword}(${this.tag})`)
      } else {
        log.success(`依赖安装成功：${this.keyword}(${this.tag})`)
      }
      
    } catch (error) {
      spinner.stop();
      console.log(error);
    }
  }

  // ========= 启动项目 ===========
  async bootstarpProject() {
    return await this.gitAPI.bootstarpProject(process.cwd(), this.keyword);
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
