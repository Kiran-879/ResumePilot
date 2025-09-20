# Generated manually for LLM enhanced evaluation system

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('evaluations', '0001_initial'),
    ]

    operations = [
        # Remove old fields
        migrations.RemoveField(
            model_name='evaluation',
            name='hard_match_score',
        ),
        migrations.RemoveField(
            model_name='evaluation',
            name='soft_match_score',
        ),
        migrations.RemoveField(
            model_name='evaluation',
            name='matched_skills',
        ),
        migrations.RemoveField(
            model_name='evaluation',
            name='missing_skills',
        ),
        migrations.RemoveField(
            model_name='evaluation',
            name='matched_qualifications',
        ),
        migrations.RemoveField(
            model_name='evaluation',
            name='missing_qualifications',
        ),
        migrations.RemoveField(
            model_name='evaluation',
            name='verdict',
        ),
        migrations.RemoveField(
            model_name='evaluation',
            name='feedback',
        ),
        migrations.RemoveField(
            model_name='evaluation',
            name='improvement_suggestions',
        ),
        
        # Add new LLM-enhanced fields
        migrations.AddField(
            model_name='evaluation',
            name='hard_skills_score',
            field=models.FloatField(default=0.0, help_text='Score for hard/technical skills (0-100)'),
        ),
        migrations.AddField(
            model_name='evaluation',
            name='soft_skills_score',
            field=models.FloatField(default=0.0, help_text='Score for soft skills and interpersonal abilities (0-100)'),
        ),
        migrations.AddField(
            model_name='evaluation',
            name='experience_score',
            field=models.FloatField(default=0.0, help_text='Score for work experience relevance (0-100)'),
        ),
        migrations.AddField(
            model_name='evaluation',
            name='education_score',
            field=models.FloatField(default=0.0, help_text='Score for educational background (0-100)'),
        ),
        migrations.AddField(
            model_name='evaluation',
            name='semantic_similarity_score',
            field=models.FloatField(default=0.0, help_text='Semantic similarity between resume and job description (0-100)'),
        ),
        migrations.AddField(
            model_name='evaluation',
            name='recommendation',
            field=models.CharField(
                choices=[
                    ('highly_recommended', 'Highly Recommended'),
                    ('recommended', 'Recommended'),
                    ('conditionally_recommended', 'Conditionally Recommended'),
                    ('not_recommended', 'Not Recommended')
                ],
                default='not_recommended',
                max_length=30
            ),
        ),
        migrations.AddField(
            model_name='evaluation',
            name='strengths',
            field=models.TextField(blank=True, help_text='Key strengths identified by LLM analysis'),
        ),
        migrations.AddField(
            model_name='evaluation',
            name='areas_for_improvement',
            field=models.TextField(blank=True, help_text='Areas identified for improvement by LLM analysis'),
        ),
        migrations.AddField(
            model_name='evaluation',
            name='detailed_feedback',
            field=models.TextField(blank=True, help_text='Comprehensive feedback from LLM analysis'),
        ),
        migrations.AddField(
            model_name='evaluation',
            name='recommendations_json',
            field=models.JSONField(blank=True, default=dict, help_text='Structured recommendations from LLM in JSON format'),
        ),
        migrations.AddField(
            model_name='evaluation',
            name='embeddings_stored',
            field=models.BooleanField(default=False, help_text='Whether embeddings have been stored in vector database'),
        ),
        migrations.AddField(
            model_name='evaluation',
            name='llm_processing_successful',
            field=models.BooleanField(default=False, help_text='Whether LLM processing completed successfully'),
        ),
    ]