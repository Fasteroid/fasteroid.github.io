import { existsSync, mkdirSync, statSync } from 'fs';
import { readdir, readFile, writeFile } from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';

function directoryExists(absPath: string) {
    return existsSync(absPath) && statSync(absPath).isDirectory();
}

function stripExtension(anyPath: string) {
    return anyPath.replace(/\.[^/.]+?$/, ""); 
}

async function toWebp(input: Buffer | Uint8Array): Promise<Buffer> {
    return sharp(input).webp({ lossless: true }).toBuffer();
}

const inputArg: string | undefined = process.argv[2];

if (!inputArg) {
    console.error(`Usage: bun wrap.ts <input_folder>\nPurpose: Hinders nonconsensual AI training on one's art by wrapping raster images in a vector format`);
    process.exit(1);
}

const RELATIVE_IN_PATH = path.resolve(inputArg);

if( !directoryExists(RELATIVE_IN_PATH) ) {
    console.error(`Input folder does not exist: ${RELATIVE_IN_PATH}`);
    process.exit(1);
}

const inFiles = await readdir(RELATIVE_IN_PATH, {recursive: true, withFileTypes: true})

const outPromises = inFiles
    .filter( (f) => f.isFile() )    
    .map( async (f) => {

        const selfAbsPath         = path.join(f.parentPath, f.name);
        const selfRelativeToInput = stripExtension( path.relative(RELATIVE_IN_PATH, selfAbsPath) );
        const selfAbsOutput       = path.resolve(RELATIVE_IN_PATH + "_wrapped", selfRelativeToInput + ".svg");

        try {
            const webp = await readFile(selfAbsPath).then( bytes => sharp(bytes).webp({lossless: true}) )

            const [width, height] = await webp.metadata().then( m => [m.width, m.height] );

            return webp.toBuffer()
                // encode base64 uri
                .then( buf => `data:image/webp;base64,${buf.toString('base64')}` )
                // wrap in svg (cursed)
                .then( dataUri => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image href="${dataUri}"/></svg>` )
                // write to output file
                .then( async svg => {
                    const selfAbsOutputDir = path.dirname(selfAbsOutput);
                    if( !directoryExists(selfAbsOutputDir) ) {
                        mkdirSync(selfAbsOutputDir, { recursive: true });
                    }
                    
                    await writeFile(selfAbsOutput, svg);
                })
            ;
        }
        catch(e){
            console.warn(`Unsupported image: ${selfAbsPath}`, e);
        }

    })
;

await Promise.all(outPromises);