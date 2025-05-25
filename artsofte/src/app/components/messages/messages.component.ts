import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { VoiceMessage } from '../../models/voice-message.model';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

// Периоды фильтрации:
interface Filter {
  period: 'Все время' | 'Сегодня' | 'Вчера';
  fromNumber: string;
  duration: number;
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})

export class MessagesComponent implements OnInit {
  // Массив всех сообщений:
  messages: VoiceMessage[] = [];
  // Отфильтрованный массив:
  filteredMessages: VoiceMessage[] = [];
  // Флаг загрузки:
  loading = true;

  // Фильтр
  filter: Filter = {
    period: 'Все время',
    fromNumber: '',
    duration: 0,
  };

  // Количество сообщений на странице:
  pageSize = 10;

  // Текущая страница (начинается с 1)
  currentPage = 1;

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.messageService.getMessages().subscribe({
      next: (data) => {
        this.messages = data;
        this.loading = false;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Ошибка загрузки сообщений:', err);
        this.loading = false;
      }
    });
  }

  // Фильтрация:
  applyFilter(): void {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    this.filteredMessages = this.messages.filter((msg) => {
      const msgDate = new Date(msg.date);

      // Фильтр по дате:
      if (this.filter.period === 'Сегодня' && msgDate.toDateString() !== today.toDateString()) {
        return false;
      }

      if (this.filter.period === 'Вчера' && msgDate.toDateString() !== yesterday.toDateString()) {
        return false;
      }

      // Фильтр по номеру отправителя:
      if (this.filter.fromNumber && !msg.from.includes(this.filter.fromNumber)) {
        return false;
      }

      // Фильтр по длительности:
      if (this.filter.duration && msg.duration > this.filter.duration) {
        return false;
      }

      // Возврат на первую страницу после применения фильтра:
      this.currentPage = 1;

      return true;
    });
  }

  // Пагинация:

  // Получение сообщений для текущей страницы
  get pagedMessages(): VoiceMessage[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredMessages.slice(startIndex, startIndex + this.pageSize);
  }

  // Переход на страницу:
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return; // защита от выхода за границы
    this.currentPage = page;
  }

  // Общее количество страниц:
  get totalPages(): number {
    return Math.ceil(this.filteredMessages.length / this.pageSize);
  }

  // Сбросить фильтр:
  resetFilter(): void {
    this.filter = {
      period: 'Все время',
      fromNumber: '',
      duration: 0,
    };
    this.applyFilter();
  }

  // Форматирование длительности сообщения
  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  onFilterChange() {
    this.applyFilter();
  }
}
