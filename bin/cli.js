#!/usr/bin/env node
const { Command } = require('commander');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline-sync');

const program = new Command();

program
  .name('create-k3s-scaffold')
  .description('CLI to scaffold k3s projects and auto-create example services')
  .version('1.0.0');

program
  .command('init <project-name>')
  .description('Generate scaffold and create two example k3s services')
  .option('--install-k3s', 'Install k3s if not installed (requires sudo)')
  .option('--dry-run', 'Show actions without executing')
  .option('--yes', 'Skip confirmation prompts')
  .action((projectName, options) => {
    const projectDir = path.resolve(process.cwd(), projectName);

    if (fs.existsSync(projectDir)) {
      console.error(`Directory ${projectName} already exists`);
      process.exit(1);
    }

    // 检查 k3s
    let k3sInstalled = false;
    try {
      execSync('which k3s', { stdio: 'ignore' });
      k3sInstalled = true;
      console.log('k3s is already installed. Skipping installation.');
    } catch {
      console.log('k3s not found.');
    }

    // 安装 k3s
    if (!k3sInstalled && options.installK3s) {
      if (!options.yes) {
        const answer = readline.question('k3s will be installed. Type yes to continue: ');
        if (answer !== 'yes') {
          console.log('Aborted');
          process.exit(1);
        }
      }

      if (options.dryRun) {
        console.log('[dry-run] Would run: sudo bash install-k3s.sh');
      } else {
        execSync(`sudo bash ${path.resolve(__dirname, '../install-k3s.sh')}`, {
          stdio: 'inherit',
        });
      }
    }

    // 创建 scaffold
    if (options.dryRun) {
      console.log(`[dry-run] Would create project directory at: ${projectDir}`);
    } else {
      fs.mkdirSync(projectDir, { recursive: true });
      console.log(`Created project directory: ${projectDir}`);
    }

    // 复制示例服务
    const services = ['service1.yaml', 'service2.yaml'];
    services.forEach(file => {
      const src = path.resolve(__dirname, '../templates', file);
      const dest = path.join(projectDir, file);
      if (options.dryRun) {
        console.log(`[dry-run] Would copy ${file} to ${projectDir}`);
      } else {
        fs.copyFileSync(src, dest);
        console.log(`Copied ${file} to project`);
      }
    });

    // 自动 kubectl apply
    if (!options.dryRun) {
      services.forEach(file => {
        try {
          execSync(`kubectl apply -f ${path.join(projectDir, file)}`, { stdio: 'inherit' });
        } catch (err) {
          console.error(`Failed to apply ${file}: ${err.message}`);
        }
      });
    } else {
      console.log('[dry-run] Would apply all services with kubectl');
    }
  });

program.parse(process.argv);
