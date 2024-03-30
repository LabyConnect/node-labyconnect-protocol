import { Buffer } from 'buffer';

export class PacketBuffer {
    public buffer: Buffer;
    private offset: number = 0;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
    }

    private extend(length: number) {
        this.buffer = Buffer.concat([this.buffer, Buffer.alloc(length)])
    }

    writeUInt8(input: number) {
        this.extend(1)
        this.buffer.writeUInt8(input, this.offset)
        this.offset += 1
    }

    readUInt8(): number {
        const value = this.buffer.readUInt8(this.offset)
        this.offset += 1
        return value
    }

    writeVarInt(input: number) {
        while ((input & -128) !== 0) {
            this.writeUInt8(input & 127 | 128)
            input >>>= 7;
        }

        this.writeUInt8(input);
    }

    readVarInt(): number {
        let value = 0;
        let size = 0;

        let byte: number;
        do {
            byte = this.readUInt8();
            value |= (byte & 127) << size++ * 7;

            if (size > 5) {
                throw new Error("VarInt is too big")
            }
        } while ((byte & 128) === 128);

        return value;
    }

    varIntSize(input: number): number {
        let size = 0;
        do {
            input >>>= 7;
            size++;
        } while (input !== 0);

        return size;
    }

    writeLong(input: bigint) {
        this.extend(8)
        this.buffer.writeBigInt64BE(input, this.offset)
        this.offset += 8
    }

    readLong(): bigint {
        const value = this.buffer.readBigInt64BE(this.offset)
        this.offset += 8
        return value
    }

    writeInt(input: number) {
        this.extend(4)
        this.buffer.writeInt32BE(input, this.offset)
        this.offset += 4
    }

    readInt(): number {
        const value = this.buffer.readInt32BE(this.offset)
        this.offset += 4
        return value
    }

    writeString(input: string) {
        this.writeInt(Buffer.byteLength(input, 'utf-8'))
        this.extend(Buffer.byteLength(input, 'utf-8'))
        this.buffer.write(input, this.offset, 'utf-8')
        this.offset += Buffer.byteLength(input, 'utf-8')
    }

    readString(): string {
        const length = this.readInt()
        const value = this.buffer.toString('utf-8', this.offset, this.offset + length)
        this.offset += length
        return value
    }

    writeBoolean(input: boolean) {
        this.writeUInt8(input ? 1 : 0)
    }

    readBoolean(): boolean {
        return this.readUInt8() === 1
    }

    writeByte(input: number) {
        this.writeUInt8(input)
    }

    readByte(): number {
        return this.readUInt8()
    }

    concat(buffer: Buffer) {
        this.buffer = Buffer.concat([this.buffer, buffer])
        this.offset += buffer.length
    }

    readBytes(): Buffer {
        const length = this.readInt()
        const value = this.buffer.slice(this.offset, this.offset + length)
        this.offset += length
        return value
    }

    writeBytes(input: Buffer) {
        this.writeInt(input.length)
        this.extend(input.length)
        input.copy(this.buffer, this.offset)
        this.offset += input.length
    }
}