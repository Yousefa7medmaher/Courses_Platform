#!/usr/bin/env node

/**
 * Image System Validation Script
 * Validates the complete image system implementation
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

class ImageSystemValidator {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            checks: []
        };
    }

    async validate() {
        console.log('🔍 Validating Image System Implementation...\n');

        await this.validateFileStructure();
        await this.validateDefaultImages();
        await this.validateJavaScriptFiles();
        await this.validateCSSFiles();
        await this.validateTemplateFiles();
        await this.validateMiddleware();
        await this.validateRoutes();
        await this.validateConfiguration();

        this.generateReport();
    }

    async validateFileStructure() {
        console.log('📁 Validating File Structure...');

        const requiredFiles = [
            'public/js/image-utils.js',
            'public/js/progressive-loading.js',
            'public/js/advanced-lazy-loading.js',
            'public/js/image-performance.js',
            'public/js/image-system-tests.js',
            'public/css/enhanced-images.css',
            'middlewares/imageDefaults.js',
            'middlewares/imageSecurity.js',
            'utils/imageHelpers.js',
            'utils/imageOptimizer.js'
        ];

        for (const file of requiredFiles) {
            await this.checkFileExists(file, 'Required file');
        }

        const requiredDirectories = [
            'public/images/defaults'
        ];

        for (const dir of requiredDirectories) {
            await this.checkDirectoryExists(dir, 'Required directory');
        }
    }

    async validateDefaultImages() {
        console.log('🖼️ Validating Default Images...');

        const defaultImages = [
            'course-placeholder.svg',
            'user-placeholder.svg',
            'video-placeholder.svg',
            'programming-placeholder.svg',
            'design-placeholder.svg',
            'business-placeholder.svg',
            'marketing-placeholder.svg',
            'photography-placeholder.svg',
            'music-placeholder.svg'
        ];

        for (const image of defaultImages) {
            const imagePath = `public/images/defaults/${image}`;
            await this.checkFileExists(imagePath, 'Default image');
            
            if (await this.fileExists(imagePath)) {
                await this.validateSVGContent(imagePath);
            }
        }
    }

    async validateJavaScriptFiles() {
        console.log('📜 Validating JavaScript Files...');

        const jsFiles = [
            'public/js/image-utils.js',
            'public/js/progressive-loading.js',
            'public/js/advanced-lazy-loading.js',
            'public/js/image-performance.js'
        ];

        for (const file of jsFiles) {
            if (await this.fileExists(file)) {
                await this.validateJSContent(file);
            }
        }
    }

    async validateCSSFiles() {
        console.log('🎨 Validating CSS Files...');

        const cssFile = 'public/css/enhanced-images.css';
        if (await this.fileExists(cssFile)) {
            await this.validateCSSContent(cssFile);
        }
    }

    async validateTemplateFiles() {
        console.log('📄 Validating Template Files...');

        const templateFiles = [
            'views/layouts/layout.ejs',
            'views/partials/course-card.ejs',
            'views/courses/details.ejs',
            'views/index.ejs'
        ];

        for (const file of templateFiles) {
            if (await this.fileExists(file)) {
                await this.validateTemplateContent(file);
            }
        }
    }

    async validateMiddleware() {
        console.log('⚙️ Validating Middleware...');

        const middlewareFiles = [
            'middlewares/upload.js',
            'middlewares/imageDefaults.js',
            'middlewares/imageSecurity.js'
        ];

        for (const file of middlewareFiles) {
            if (await this.fileExists(file)) {
                await this.validateMiddlewareContent(file);
            }
        }
    }

    async validateRoutes() {
        console.log('🛣️ Validating Routes...');

        const routeFile = 'routes/courseRoutes.js';
        if (await this.fileExists(routeFile)) {
            await this.validateRouteContent(routeFile);
        }
    }

    async validateConfiguration() {
        console.log('⚙️ Validating Configuration...');

        // Check package.json for required dependencies
        const packageJsonPath = 'package.json';
        if (await this.fileExists(packageJsonPath)) {
            await this.validatePackageJson(packageJsonPath);
        }

        // Check app.js for middleware integration
        const appJsPath = 'app.js';
        if (await this.fileExists(appJsPath)) {
            await this.validateAppJsIntegration(appJsPath);
        }
    }

    async checkFileExists(filePath, description) {
        const fullPath = path.join(projectRoot, filePath);
        const exists = await this.fileExists(filePath);
        
        if (exists) {
            this.recordCheck(`${description}: ${filePath}`, true);
        } else {
            this.recordCheck(`${description}: ${filePath}`, false, 'File not found');
        }
    }

    async checkDirectoryExists(dirPath, description) {
        const fullPath = path.join(projectRoot, dirPath);
        
        try {
            const stats = await fs.stat(fullPath);
            if (stats.isDirectory()) {
                this.recordCheck(`${description}: ${dirPath}`, true);
            } else {
                this.recordCheck(`${description}: ${dirPath}`, false, 'Path exists but is not a directory');
            }
        } catch (error) {
            this.recordCheck(`${description}: ${dirPath}`, false, 'Directory not found');
        }
    }

    async validateSVGContent(filePath) {
        try {
            const content = await fs.readFile(path.join(projectRoot, filePath), 'utf8');
            
            if (content.includes('<svg')) {
                this.recordCheck(`SVG format: ${filePath}`, true);
            } else {
                this.recordCheck(`SVG format: ${filePath}`, false, 'Not a valid SVG file');
            }
            
            if (content.includes('viewBox')) {
                this.recordCheck(`SVG viewBox: ${filePath}`, true);
            } else {
                this.recordCheck(`SVG viewBox: ${filePath}`, false, 'Missing viewBox attribute', true);
            }
        } catch (error) {
            this.recordCheck(`SVG validation: ${filePath}`, false, error.message);
        }
    }

    async validateJSContent(filePath) {
        try {
            const content = await fs.readFile(path.join(projectRoot, filePath), 'utf8');
            
            // Check for class definitions
            if (content.includes('class ')) {
                this.recordCheck(`JS class structure: ${filePath}`, true);
            } else {
                this.recordCheck(`JS class structure: ${filePath}`, false, 'No class definitions found', true);
            }
            
            // Check for error handling
            if (content.includes('try {') && content.includes('catch')) {
                this.recordCheck(`JS error handling: ${filePath}`, true);
            } else {
                this.recordCheck(`JS error handling: ${filePath}`, false, 'Missing error handling', true);
            }
            
            // Check for exports
            if (content.includes('export') || content.includes('window.')) {
                this.recordCheck(`JS exports: ${filePath}`, true);
            } else {
                this.recordCheck(`JS exports: ${filePath}`, false, 'No exports found', true);
            }
        } catch (error) {
            this.recordCheck(`JS validation: ${filePath}`, false, error.message);
        }
    }

    async validateCSSContent(filePath) {
        try {
            const content = await fs.readFile(path.join(projectRoot, filePath), 'utf8');
            
            const requiredClasses = [
                '.image-container',
                '.enhanced-image',
                '.image-skeleton',
                '.loading-skeleton',
                '.image-placeholder-error'
            ];
            
            for (const className of requiredClasses) {
                if (content.includes(className)) {
                    this.recordCheck(`CSS class: ${className}`, true);
                } else {
                    this.recordCheck(`CSS class: ${className}`, false, 'Class not found');
                }
            }
            
            // Check for animations
            if (content.includes('@keyframes')) {
                this.recordCheck('CSS animations', true);
            } else {
                this.recordCheck('CSS animations', false, 'No animations found', true);
            }
            
            // Check for responsive design
            if (content.includes('@media')) {
                this.recordCheck('CSS responsive design', true);
            } else {
                this.recordCheck('CSS responsive design', false, 'No media queries found', true);
            }
        } catch (error) {
            this.recordCheck(`CSS validation: ${filePath}`, false, error.message);
        }
    }

    async validateTemplateContent(filePath) {
        try {
            const content = await fs.readFile(path.join(projectRoot, filePath), 'utf8');
            
            // Check for enhanced image usage
            if (content.includes('getCourseImageUrl') || content.includes('getUserAvatarUrl')) {
                this.recordCheck(`Template helper usage: ${filePath}`, true);
            } else {
                this.recordCheck(`Template helper usage: ${filePath}`, false, 'No image helpers found', true);
            }
            
            // Check for error handling in templates
            if (content.includes('onerror')) {
                this.recordCheck(`Template error handling: ${filePath}`, true);
            } else {
                this.recordCheck(`Template error handling: ${filePath}`, false, 'No onerror handlers', true);
            }
            
            // Check for responsive images
            if (content.includes('<picture>') || content.includes('srcset')) {
                this.recordCheck(`Template responsive images: ${filePath}`, true);
            } else {
                this.recordCheck(`Template responsive images: ${filePath}`, false, 'No responsive image markup', true);
            }
        } catch (error) {
            this.recordCheck(`Template validation: ${filePath}`, false, error.message);
        }
    }

    async validateMiddlewareContent(filePath) {
        try {
            const content = await fs.readFile(path.join(projectRoot, filePath), 'utf8');
            
            // Check for exports
            if (content.includes('export')) {
                this.recordCheck(`Middleware exports: ${filePath}`, true);
            } else {
                this.recordCheck(`Middleware exports: ${filePath}`, false, 'No exports found');
            }
            
            // Check for error handling
            if (content.includes('try {') && content.includes('catch')) {
                this.recordCheck(`Middleware error handling: ${filePath}`, true);
            } else {
                this.recordCheck(`Middleware error handling: ${filePath}`, false, 'Missing error handling', true);
            }
        } catch (error) {
            this.recordCheck(`Middleware validation: ${filePath}`, false, error.message);
        }
    }

    async validateRouteContent(filePath) {
        try {
            const content = await fs.readFile(path.join(projectRoot, filePath), 'utf8');
            
            // Check for security middleware integration
            if (content.includes('validateImageUpload') && content.includes('validateImageUrl')) {
                this.recordCheck('Route security integration', true);
            } else {
                this.recordCheck('Route security integration', false, 'Security middleware not integrated');
            }
            
            // Check for image processing middleware
            if (content.includes('processLocalImage')) {
                this.recordCheck('Route image processing', true);
            } else {
                this.recordCheck('Route image processing', false, 'Image processing middleware not integrated', true);
            }
        } catch (error) {
            this.recordCheck(`Route validation: ${filePath}`, false, error.message);
        }
    }

    async validatePackageJson(filePath) {
        try {
            const content = await fs.readFile(path.join(projectRoot, filePath), 'utf8');
            const packageJson = JSON.parse(content);
            
            const requiredDependencies = ['sharp', 'multer', 'cloudinary'];
            
            for (const dep of requiredDependencies) {
                if (packageJson.dependencies && packageJson.dependencies[dep]) {
                    this.recordCheck(`Dependency: ${dep}`, true);
                } else {
                    this.recordCheck(`Dependency: ${dep}`, false, 'Dependency not found');
                }
            }
        } catch (error) {
            this.recordCheck('Package.json validation', false, error.message);
        }
    }

    async validateAppJsIntegration(filePath) {
        try {
            const content = await fs.readFile(path.join(projectRoot, filePath), 'utf8');
            
            const requiredIntegrations = [
                'addImageSecurityHeaders',
                'serveDefaultImage',
                'addImageHelpersToLocals'
            ];
            
            for (const integration of requiredIntegrations) {
                if (content.includes(integration)) {
                    this.recordCheck(`App.js integration: ${integration}`, true);
                } else {
                    this.recordCheck(`App.js integration: ${integration}`, false, 'Integration not found');
                }
            }
        } catch (error) {
            this.recordCheck('App.js validation', false, error.message);
        }
    }

    async fileExists(filePath) {
        try {
            await fs.access(path.join(projectRoot, filePath));
            return true;
        } catch {
            return false;
        }
    }

    recordCheck(name, passed, error = null, isWarning = false) {
        if (passed) {
            this.results.passed++;
            console.log(`✅ ${name}`);
        } else if (isWarning) {
            this.results.warnings++;
            console.log(`⚠️ ${name}: ${error}`);
        } else {
            this.results.failed++;
            console.log(`❌ ${name}: ${error}`);
        }
        
        this.results.checks.push({
            name,
            passed,
            error,
            isWarning
        });
    }

    generateReport() {
        const total = this.results.passed + this.results.failed + this.results.warnings;
        const successRate = total > 0 ? (this.results.passed / total * 100).toFixed(2) : 0;
        
        console.log('\n📊 IMAGE SYSTEM VALIDATION REPORT');
        console.log('=====================================');
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`⚠️ Warnings: ${this.results.warnings}`);
        console.log(`📈 Success Rate: ${successRate}%`);
        console.log('=====================================');
        
        if (this.results.failed > 0) {
            console.log('\n❌ CRITICAL ISSUES:');
            this.results.checks
                .filter(check => !check.passed && !check.isWarning)
                .forEach(check => {
                    console.log(`- ${check.name}: ${check.error}`);
                });
        }
        
        if (this.results.warnings > 0) {
            console.log('\n⚠️ WARNINGS:');
            this.results.checks
                .filter(check => check.isWarning)
                .forEach(check => {
                    console.log(`- ${check.name}: ${check.error}`);
                });
        }
        
        console.log('\n🎯 RECOMMENDATIONS:');
        if (this.results.failed === 0) {
            console.log('✨ Image system implementation is complete and ready for production!');
        } else {
            console.log('🔧 Please address the critical issues before deploying to production.');
        }
        
        if (this.results.warnings > 0) {
            console.log('💡 Consider addressing warnings for optimal performance and user experience.');
        }
    }
}

// Run validation
const validator = new ImageSystemValidator();
validator.validate().catch(console.error);
