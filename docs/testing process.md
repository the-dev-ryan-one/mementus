
Testing process to check a ported file ( JS -> TS )

1) compile with   npx tsc

    use a strict tsconfig.js :

        {
        "include": ["src/**/*"],
        "exclude": ["node_modules", "dist", "types", "test"],
        "compilerOptions": {
            "rootDir": "src",
            "outDir": "types",

            "target": "ES2020",
            "module": "NodeNext",
            "moduleResolution": "NodeNext",

            "allowJs": false,
            "checkJs": false,
            "allowImportingTsExtensions": true,

            "declaration": true,
            "emitDeclarationOnly": true,

            "noEmitOnError": true,
            "skipLibCheck": true,

            "strict": true,

            "noUnusedLocals": true,
            "noUnusedParameters": true,
            "noImplicitReturns": true,
            "noFallthroughCasesInSwitch": true,
            "noUncheckedIndexedAccess": true,
            "exactOptionalPropertyTypes": true,
            "noPropertyAccessFromIndexSignature": true,
            "forceConsistentCasingInFileNames": true
            }
        }

2) run the AVA test script : npm test


npm run build:compile and npm run test both work (as of 10/9/26)

