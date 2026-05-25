import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookStatusDto } from './dto/update-book-status.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUserId } from 'src/auth/current-user-id.decorator';
import { Public } from 'src/auth/public.decorator';

/**
 * REST controller for book-related routes.
 * Delegates business logic to `BooksService` and handles parameter parsing.
 */
@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  /**
   * GET /books
   * Returns all books persisted in the `book` table (not user-specific).
   */
  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all books' })
  @ApiResponse({ status: 200, description: 'Books retrieved successfully' })
  async getAllBooks() {
    return this.booksService.findAllBooks();
  }

  /**
   * GET /books/random
   * Returns randoms books persisted in the `book` table (not user-specific).
   */
  @Get('random')
  @Public()
  async getRandomBooks(@Query('limit') limit: string = '10') {
    return this.booksService.getRandomBooks(parseInt(limit));
  }

  /**
   * GET /books/library
   * Returns all books linked to the authenticated user's list.
   */
  @Get('library')
  @ApiOperation({ summary: 'Get all books for a user' })
  @ApiResponse({
    status: 200,
    description: 'User books retrieved successfully',
  })
  async getUserBooks(@CurrentUserId() userId: number) {
    return this.booksService.findUserBooks(userId);
  }

  /**
   * POST /books/library
   * Adds a book to the authenticated user's list.
   */
  @Post('library')
  @ApiOperation({ summary: 'Add a book to a user library' })
  @ApiResponse({ status: 201, description: 'Book added to user library' })
  async addBookToUserList(
    @CurrentUserId() userId: number,
    @Body() createBookDto: CreateBookDto,
  ) {
    return this.booksService.addToUserList(userId, createBookDto);
  }

  /**
   * DELETE /books/library/book/:bookId
   * Removes the link between a book and the authenticated user's list.
   */
  @Delete('library/book/:bookId')
  @ApiOperation({ summary: 'Remove a book from a user library' })
  @ApiResponse({ status: 200, description: 'Book removed from user library' })
  async removeBookFromUserList(
    @CurrentUserId() userId: number,
    @Param('bookId', ParseIntPipe) bookId: number,
  ) {
    return this.booksService.removeFromUserList(userId, bookId);
  }

  /**
   * PATCH /books/library/book/:bookId/status
   * Updates the reading dates for a book in the authenticated user's list.
   */
  @Patch('library/book/:bookId/status')
  @ApiOperation({ summary: 'Update reading status for a book in user library' })
  @ApiResponse({ status: 200, description: 'Book status updated successfully' })
  async updateBookStatusDates(
    @CurrentUserId() userId: number,
    @Param('bookId', ParseIntPipe) bookId: number,
    @Body() updateDatesDto: UpdateBookStatusDto,
  ) {
    const readStart = updateDatesDto.readStart
      ? new Date(updateDatesDto.readStart)
      : null;
    const readEnd = updateDatesDto.readEnd
      ? new Date(updateDatesDto.readEnd)
      : null;

    return this.booksService.updateBookStatus(
      userId,
      bookId,
      readStart,
      readEnd,
    );
  }

  /**
   * GET /books/:bookId/categories
   * Get all categories for a specific book
   */
  @Get(':bookId/categories')
  @ApiOperation({ summary: 'Get all categories for a book' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  async getCategoriesForBook(
    @Param('bookId', ParseIntPipe) bookId: number,
  ): Promise<{ id: number; name: string }[]> {
    return this.booksService.getCategoriesForBook(bookId);
  }
}
